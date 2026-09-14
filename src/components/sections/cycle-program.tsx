"use client";

import { Dumbbell, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Cycle } from "@/lib/types";
import { plannedWorkoutHref } from "@/lib/cycle-utils";
import { getCurrentWeek } from "@/lib/metrics";

export function CycleProgram({ cycle }: { cycle?: Cycle | null }) {
  if (!cycle) return <EmptyState icon={Dumbbell} title="No hay un ciclo activo" description="Configura tus marcas para crear el primer bloque de ocho semanas." />;
  const currentWeek = getCurrentWeek(cycle);
  return (
    <div className="border-t border-[var(--border)]">
      {cycle.program_template.map((week) => (
        <details key={`${cycle.id}-${week.week_number}`} open={week.week_number === currentWeek} className="group border-b border-[var(--border)]">
          <summary className="flex min-h-20 list-none items-center justify-between gap-4 py-5">
            <span className="flex items-center gap-5"><span className="font-mono text-xs text-[var(--foreground-muted)]">{String(week.week_number).padStart(2, "0")}</span><span><span className="block text-sm font-semibold">{week.phase}</span><span className="mt-1 block text-xs text-[var(--foreground-muted)]">{week.sessions.length} sesiones</span></span></span>
            <span className="font-mono text-lg text-[var(--foreground-muted)] group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p className="mb-5 max-w-xl text-xs leading-5 text-[var(--foreground-muted)]">{week.goal}</p>
          <div className="pb-5">
            {week.sessions.map((session, index) => (
              <section key={index} className="border-t border-[var(--border)] py-5">
                <div className="flex items-center justify-between gap-3"><div><p className="label">{session.day_label}</p><h3 className="mt-2 text-sm font-semibold">{session.focus}</h3></div><Link href={plannedWorkoutHref(cycle.id, week.week_number, index)} className="text-link">Entrenar <ArrowUpRight size={14} /></Link></div>
                {session.notes ? <p className="mt-3 text-xs leading-5 text-[var(--foreground-muted)]">{session.notes}</p> : null}
                <ul className="mt-4 space-y-3">{session.exercises.map((exercise, i) => <li key={i} className="flex justify-between gap-4 text-xs"><span className="text-[var(--foreground-muted)]">{exercise.name}</span><span className="max-w-[45%] text-right font-mono text-[11px]">{exercise.prescription}</span></li>)}</ul>
              </section>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
