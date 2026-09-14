"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readLocalDataset } from "@/lib/local-data";

export function LocalSetupForm() {
  const { startLocal } = useAuth();
  const router = useRouter();
  const [savedName, setSavedName] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setSavedName(readLocalDataset()?.profile?.full_name ?? null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "No se pudo leer el perfil local.");
      } finally {
        setChecking(false);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      await startLocal(savedName ? undefined : {
        fullName: String(fields.get("fullName") ?? ""),
        bodyweight: Number(fields.get("bodyweight")),
        squatRm: Number(fields.get("squatRm")),
        benchRm: Number(fields.get("benchRm")),
        deadliftRm: Number(fields.get("deadliftRm")),
        demo,
      });
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo guardar el perfil local.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">Sin cuenta</p>
      <h2 className="mt-3 text-2xl font-semibold">Tu entrenamiento, en este navegador</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
        Registra ciclos, sesiones, recuperación y PRs sin configurar una cuenta. Los datos se conservan al cerrar la página; al borrar el almacenamiento del navegador se pierden. No se sincronizan con una cuenta.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {savedName ? (
          <p className="rounded-[3px] bg-[var(--surface)] p-4">Perfil guardado: <strong>{savedName}</strong>. Continuar recupera todos tus registros.</p>
        ) : !checking ? (
          <>
            <div>
              <Label htmlFor="local-name">Nombre</Label>
              <Input id="local-name" name="fullName" placeholder="Tu nombre" minLength={2} maxLength={100} required />
            </div>
            <div>
              <Label htmlFor="local-weight">Peso corporal (kg)</Label>
              <Input id="local-weight" name="bodyweight" type="number" min="1" max="500" step="0.1" placeholder="82" required />
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-[3px] border border-[var(--border)] p-4 text-sm">
              <input type="checkbox" checked={demo} onChange={(event) => setDemo(event.target.checked)} className="mt-1" />
              <span>Explorar con marcas de ejemplo <span className="mt-1 block text-[var(--foreground-muted)]">405 / 275 / 365 lb ≈ 183.7 / 124.7 / 165.6 kg. Se crea un ciclo demo sin sesiones inventadas.</span></span>
            </label>
            {!demo ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div><Label htmlFor="local-squat">Sentadilla 1RM (kg)</Label><Input id="local-squat" name="squatRm" type="number" min="1" max="1000" step="0.1" required /></div>
                <div><Label htmlFor="local-bench">Banca 1RM (kg)</Label><Input id="local-bench" name="benchRm" type="number" min="1" max="1000" step="0.1" required /></div>
                <div><Label htmlFor="local-deadlift">Peso muerto 1RM (kg)</Label><Input id="local-deadlift" name="deadliftRm" type="number" min="1" max="1000" step="0.1" required /></div>
              </div>
            ) : null}
            <p className="text-xs leading-5 text-[var(--foreground-muted)]">Se crea un primer ciclo de ocho semanas a partir de hoy. Puedes crear otros ciclos con tus nuevas marcas.</p>
          </>
        ) : null}
        {error ? <p role="alert" className="text-sm text-[#f87171]">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={checking || submitting}>
          {checking ? "Leyendo perfil…" : submitting ? "Guardando…" : savedName ? "Continuar con mis datos locales" : "Empezar sin cuenta"}
        </Button>
      </form>
    </Card>
  );
}
