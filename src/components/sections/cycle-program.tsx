"use client";

import { Dumbbell } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Cycle } from "@/lib/types";
import { plannedWorkoutHref } from "@/lib/cycle-utils";

export function CycleProgram({ cycle }: { cycle?: Cycle | null }) {
  if (!cycle) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No hay un ciclo activo"
        description="Crea tu primer bloque de 8 semanas y la app generará la estructura completa automáticamente."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {cycle.program_template.map((week) => (
        <Card key={week.week_number} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Semana {week.week_number}</p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{week.phase}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{week.goal}</p>
            </div>
            <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              {week.sessions.length} sesiones
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {week.sessions.map((session, sessionIndex) => (
              <div key={`${week.week_number}-${session.day_label}-${session.focus}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{session.day_label}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">{session.focus}</p>
                  </div>
                  <Link
                    href={plannedWorkoutHref(cycle.id, week.week_number, sessionIndex)}
                    className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)]"
                  >
                    Iniciar sesión
                  </Link>
                </div>
                {session.notes ? (
                  <p className="mt-3 text-sm text-[var(--foreground-soft)]">{session.notes}</p>
                ) : null}
                <ul className="mt-4 space-y-2 text-sm text-[var(--foreground-muted)]">
                  {session.exercises.map((exercise) => (
                    <li key={`${exercise.name}-${exercise.prescription}`} className="flex items-start justify-between gap-3">
                      <span>{exercise.name}</span>
                      <span className="shrink-0 text-[var(--foreground)]">{exercise.prescription}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
