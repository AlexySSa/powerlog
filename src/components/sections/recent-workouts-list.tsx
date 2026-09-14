"use client";

import { Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getBestSetLabel } from "@/lib/metrics";
import { Workout } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export function RecentWorkoutsList({ workouts }: { workouts: Workout[] }) {
  const ordered = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  if (!ordered.length) return <EmptyState icon={Activity} title="Sin sesiones registradas" description="Los entrenamientos que guardes aparecerán aquí." />;
  return (
    <div className="border-t border-[var(--border)]">
      {ordered.map((workout) => {
        const volume = workout.sets.reduce((sum, set) => sum + set.volume, 0);
        const best = [...workout.sets].sort((a, b) => b.best_set_weight - a.best_set_weight)[0];
        return <article key={workout.id} className="grid gap-5 border-b border-[var(--border)] py-5 sm:grid-cols-[1fr_auto]">
          <div><p className="font-mono text-[10px] text-[var(--foreground-muted)]">{formatDate(workout.date)} / S{workout.week_number} / {workout.day_label}</p><h3 className="mt-2 text-base font-semibold tracking-tight">{workout.title}</h3>{workout.notes ? <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">{workout.notes}</p> : null}</div>
          <dl className="flex gap-8"><div><dt className="label">Volumen</dt><dd className="mt-2 font-mono text-sm">{formatNumber(volume)} kg</dd></div><div><dt className="label">Mejor serie</dt><dd className="mt-2 font-mono text-sm">{best ? getBestSetLabel(best) : "—"}</dd></div></dl>
        </article>;
      })}
    </div>
  );
}
