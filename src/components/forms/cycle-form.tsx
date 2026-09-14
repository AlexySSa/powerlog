"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculateCycleEndDate } from "@/lib/cycle-utils";
import { localDateInput } from "@/lib/utils";
import { cycleSchema } from "@/lib/validators";

type FormValues = z.infer<typeof cycleSchema>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-2 text-xs text-[#f87171]">{message}</p> : null;
}

export function CycleForm() {
  const { createCycle } = useAppData();
  const { t } = useI18n();
  const today = localDateInput();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(cycleSchema) as Resolver<FormValues>,
    defaultValues: {
      name: "Bloque 8 semanas",
      start_date: today,
      goal: t("defaultCycleGoal"),
      initial_squat_rm: 180,
      initial_bench_rm: 120,
      initial_deadlift_rm: 220,
      initial_bodyweight: 82,
    },
  });

  const startDate = useWatch({ control, name: "start_date" });

  const onSubmit = async (values: FormValues) => {
    await createCycle(values);
    reset({
      ...values,
      name: "",
      goal: t("defaultCycleGoal"),
    });
  };

  return (
    <Card className="p-5">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="md:col-span-2">
          <Label htmlFor="cycle-name">{t("cycleName")}</Label>
          <Input id="cycle-name" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <Label htmlFor="start-date">{t("startDate")}</Label>
          <Input id="start-date" type="date" {...register("start_date")} />
          <FieldError message={errors.start_date?.message} />
        </div>

        <div>
          <Label htmlFor="end-date">{t("endDate")}</Label>
          <Input id="end-date" value={startDate ? calculateCycleEndDate(startDate) : ""} readOnly />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="goal">{t("goal")}</Label>
          <Textarea id="goal" {...register("goal")} />
          <FieldError message={errors.goal?.message} />
        </div>

        <div>
          <Label htmlFor="squat">{t("initialSquat")}</Label>
          <Input id="squat" type="number" step="0.5" {...register("initial_squat_rm")} />
          <FieldError message={errors.initial_squat_rm?.message} />
        </div>

        <div>
          <Label htmlFor="bench">{t("initialBench")}</Label>
          <Input id="bench" type="number" step="0.5" {...register("initial_bench_rm")} />
          <FieldError message={errors.initial_bench_rm?.message} />
        </div>

        <div>
          <Label htmlFor="deadlift">{t("initialDeadlift")}</Label>
          <Input id="deadlift" type="number" step="0.5" {...register("initial_deadlift_rm")} />
          <FieldError message={errors.initial_deadlift_rm?.message} />
        </div>

        <div>
          <Label htmlFor="bodyweight">{t("initialBodyweight")}</Label>
          <Input id="bodyweight" type="number" step="0.1" {...register("initial_bodyweight")} />
          <FieldError message={errors.initial_bodyweight?.message} />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? `${t("loading")}...` : t("createCycle")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
