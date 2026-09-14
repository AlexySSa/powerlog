"use client";

import { Activity } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { getBestSetLabel } from "@/lib/metrics";
import { Workout } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function RecentWorkoutsList({ workouts }: { workouts: Workout[] }) {
  const orderedWorkouts = [...workouts].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  if (orderedWorkouts.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Sin sesiones recientes"
        description="Cuando registres tu próximo entreno, aparecerá aquí con volumen y mejor set."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orderedWorkouts.map((workout) => {
        const totalVolume = workout.sets.reduce((sum, entry) => sum + entry.volume, 0);
        const bestSet = [...workout.sets].sort((a, b) => b.best_set_weight - a.best_set_weight)[0];

        return (
          <Card key={workout.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {formatDate(workout.date)} · Semana {workout.week_number} · {workout.day_label}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{workout.title}</h3>
                <p className="mt-2 text-sm text-[var(--foreground-soft)]">{workout.notes || "Sin notas."}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">Volumen</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{totalVolume.toFixed(0)} kg</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">Mejor set</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {bestSet ? getBestSetLabel(bestSet) : "--"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
