"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { WorkoutForm } from "@/components/forms/workout-form";
import { RecentWorkoutsList } from "@/components/sections/recent-workouts-list";
import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { resolvePlannedSession } from "@/lib/cycle-utils";

function SessionWorkoutForm() {
  const params = useSearchParams();
  const { data, loading } = useAppData();
  if (loading && !data.profile) return <Card className="p-5" role="status">Cargando sesión…</Card>;
  const plan = resolvePlannedSession(data.cycles, params.get("cycle"), params.get("week"), params.get("session"));
  const requestedPlan = params.has("cycle") || params.has("week") || params.has("session");
  return (
    <div className="space-y-4">
      {requestedPlan && !plan ? (
        <p role="status" className="rounded-[3px] border border-[var(--border)] p-4 text-sm text-[var(--foreground-muted)]">
          La sesión del enlace no está disponible. Puedes registrar una sesión manual o elegir otra desde Ciclo.
        </p>
      ) : null}
      <WorkoutForm key={plan ? `${plan.cycle.id}-${plan.weekNumber}-${plan.sessionIndex}` : "manual"} plannedSession={plan} />
    </div>
  );
}

export default function WorkoutsPage() {
  const { recentWorkouts } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("workouts")}
        title={t("logWorkout")}
        description={t("workoutDescription")}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Suspense fallback={<Card className="p-5" role="status">Cargando sesión…</Card>}>
          <SessionWorkoutForm />
        </Suspense>
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">{t("recentSessions")}</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Cada sesión calcula volumen, mejor set y estimación de 1RM automáticamente.
          </p>
          <div className="mt-5">
            <RecentWorkoutsList workouts={recentWorkouts.slice(0, 6)} />
          </div>
        </Card>
      </div>
    </div>
  );
}
