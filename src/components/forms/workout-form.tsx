"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Resolver, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { workoutSchema } from "@/lib/validators";
import { plannedSessionSets, type PlannedSession } from "@/lib/cycle-utils";

type FormValues = z.infer<typeof workoutSchema>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-2 text-xs text-[#f87171]">{message}</p> : null;
}

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function RestTimer() {
  const [duration, setDuration] = useState(120);
  const [remaining, setRemaining] = useState(120);
  const [deadline, setDeadline] = useState<number | null>(null);
  useEffect(() => {
    if (deadline === null) return;
    const interval = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) setDeadline(null);
    }, 250);
    return () => window.clearInterval(interval);
  }, [deadline]);
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--border)] p-4">
      <div className="min-w-32 flex-1">
        <Label htmlFor="rest-duration">Descanso</Label>
        <Select id="rest-duration" value={duration} onChange={(event) => {
          const seconds = Number(event.target.value);
          setDuration(seconds);
          setRemaining(seconds);
          setDeadline(null);
        }}>
          {[60, 90, 120, 180, 300].map((seconds) => <option key={seconds} value={seconds}>{seconds / 60} min</option>)}
        </Select>
      </div>
      <span role="timer" aria-label="Tiempo de descanso restante" className="py-2 text-2xl font-semibold tabular-nums">
        {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
      </span>
      <Button type="button" variant="secondary" onClick={() => {
        if (deadline !== null) {
          setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
          setDeadline(null);
        } else {
          const seconds = remaining || duration;
          setRemaining(seconds);
          setDeadline(Date.now() + seconds * 1000);
        }
      }}>{deadline !== null ? "Pausar" : "Iniciar"}</Button>
      <Button type="button" variant="ghost" onClick={() => { setDeadline(null); setRemaining(duration); }}>Reiniciar</Button>
      <span className="sr-only" role="status">{remaining === 0 ? "Descanso terminado" : ""}</span>
    </div>
  );
}

export function WorkoutForm({ plannedSession }: { plannedSession?: PlannedSession | null }) {
  const { createWorkout, data, dashboard } = useAppData();
  const { t } = useI18n();
  const activeCycle = dashboard.activeCycle;
  const [submitError, setSubmitError] = useState("");
  const [saved, setSaved] = useState(false);
  const plannedSets = plannedSession ? plannedSessionSets(plannedSession.session) : [];

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(workoutSchema) as Resolver<FormValues>,
    defaultValues: {
      cycle_id: plannedSession?.cycle.id ?? activeCycle?.id,
      date: localToday(),
      week_number: plannedSession?.weekNumber ?? dashboard.currentWeek,
      day_label: plannedSession?.session.day_label ?? "Lunes",
      title: plannedSession?.session.focus ?? "Sesión principal",
      notes: "",
      sets: plannedSets.length ? plannedSets : [
        {
          exercise_name: "Sentadilla con barra",
          weight: 0,
          sets: 1,
          reps: 1,
          rpe: undefined,
          notes: "",
          video_url: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sets",
  });

  const watchedSets = useWatch({ control, name: "sets" }) ?? [];
  const totalVolume = watchedSets.reduce((sum, entry) => {
    const volume = Number(entry.weight) * Number(entry.sets) * Number(entry.reps);
    return sum + (Number.isFinite(volume) ? volume : 0);
  }, 0);

  const onSubmit = async (values: FormValues) => {
    setSubmitError("");
    try {
      await createWorkout(values);
      setSaved(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo guardar la sesión. Intenta de nuevo.");
    }
  };

  if (saved) return (
    <Card className="space-y-4 p-5">
      <h3 role="status" className="text-xl font-semibold">Sesión guardada</h3>
      <p className="text-sm text-[var(--foreground-muted)]">Volumen registrado: {totalVolume.toFixed(0)} kg. Ya puedes consultar tus resultados y progreso.</p>
      <Link className="inline-flex min-h-12 items-center rounded-2xl bg-[var(--accent)] px-4 font-semibold text-[var(--accent-foreground)]" href="/progress">Ver progreso</Link>
      <Button type="button" variant="secondary" onClick={() => { reset(); setSaved(false); }}>Registrar otra sesión</Button>
    </Card>
  );

  return (
    <Card className="p-5">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {plannedSession ? (
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="font-semibold">Trabajo planificado · {plannedSession.cycle.name}</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">Semana {plannedSession.weekNumber} · {plannedSession.session.day_label} · {plannedSession.session.focus}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {plannedSession.session.exercises.map((exercise, index) => <li key={index}>{exercise.name}: <strong>{exercise.prescription}</strong></li>)}
            </ul>
            {plannedSession.session.notes ? <p className="mt-3 text-sm text-[var(--foreground-muted)]">{plannedSession.session.notes}</p> : null}
            <p className="mt-3 text-xs text-[var(--foreground-muted)]">Registra abajo lo realizado. Revisa series y repeticiones precargadas; los rangos usan su mínimo. Introduce tu carga y RPE reales. La movilidad queda como referencia.</p>
          </section>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label htmlFor="workout-cycle">{t("cycle")}</Label>
            <Select id="workout-cycle" {...register("cycle_id")}>
              <option value="">{t("currentCycle")}</option>
              {data.cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="workout-date">{t("date")}</Label>
            <Input id="workout-date" type="date" {...register("date")} />
            <FieldError message={errors.date?.message} />
          </div>

          <div>
            <Label htmlFor="workout-week">{t("week")}</Label>
            <Input id="workout-week" type="number" min={1} max={8} {...register("week_number")} />
            <FieldError message={errors.week_number?.message} />
          </div>

          <div>
            <Label htmlFor="workout-day">{t("day")}</Label>
            <Input id="workout-day" {...register("day_label")} />
            <FieldError message={errors.day_label?.message} />
          </div>

          <div className="md:col-span-2 xl:col-span-4">
            <Label htmlFor="workout-title">{t("title")}</Label>
            <Input id="workout-title" {...register("title")} />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="md:col-span-2 xl:col-span-4">
            <Label htmlFor="workout-notes">{t("notes")}</Label>
            <Textarea id="workout-notes" {...register("notes")} />
          </div>
        </div>

        <RestTimer />

        <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{t("volume")}</p>
            <p className="text-2xl font-semibold text-[var(--accent)]">{totalVolume.toFixed(0)} kg</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() =>
              append({
                exercise_name: "",
                weight: 0,
                sets: 3,
                reps: 5,
                rpe: undefined,
                notes: "",
                video_url: "",
              })
            }
          >
            <Plus className="size-4" />
            {t("exercise")}
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
              {plannedSession?.session.exercises.find((exercise) => exercise.name === watchedSets[index]?.exercise_name) ? (
                <p className="mb-3 text-sm text-[var(--accent)]">Plan: {plannedSession.session.exercises.find((exercise) => exercise.name === watchedSets[index]?.exercise_name)?.prescription} · Abajo: realizado</p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div className="xl:col-span-2">
                  <Label>{t("exercise")}</Label>
                  <Input {...register(`sets.${index}.exercise_name`)} />
                  <FieldError message={errors.sets?.[index]?.exercise_name?.message} />
                </div>

                <div>
                  <Label>{t("weight")}</Label>
                  <Input aria-label={`${t("weight")} ${index + 1}`} type="number" min={0} step="0.5" {...register(`sets.${index}.weight`)} />
                  <FieldError message={errors.sets?.[index]?.weight?.message} />
                </div>

                <div>
                  <Label>{t("sets")}</Label>
                  <Input type="number" {...register(`sets.${index}.sets`)} />
                  <FieldError message={errors.sets?.[index]?.sets?.message} />
                </div>

                <div>
                  <Label>{t("reps")}</Label>
                  <Input type="number" {...register(`sets.${index}.reps`)} />
                  <FieldError message={errors.sets?.[index]?.reps?.message} />
                </div>

                <div>
                  <Label>{t("rpe")}</Label>
                  <Input type="number" min={1} max={10} step="0.5" {...register(`sets.${index}.rpe`, { setValueAs: (value) => value === "" ? undefined : Number(value) })} />
                  <FieldError message={errors.sets?.[index]?.rpe?.message} />
                </div>

                <div className="md:col-span-2 xl:col-span-3">
                  <Label>{t("video")}</Label>
                  <Input placeholder="https://..." {...register(`sets.${index}.video_url`)} />
                  <FieldError message={errors.sets?.[index]?.video_url?.message} />
                </div>

                <div className="md:col-span-2 xl:col-span-3">
                  <Label>{t("notes")}</Label>
                  <Input {...register(`sets.${index}.notes`)} />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 text-[#f87171]"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="size-4" />
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>

        {submitError ? <p role="alert" className="text-sm text-[#f87171]">{submitError}</p> : null}
        <FieldError message={errors.sets?.root?.message ?? errors.sets?.message} />
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? `${t("loading")}...` : t("logWorkout")}
        </Button>
      </form>
    </Card>
  );
}
