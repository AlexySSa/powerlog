import { addDays, formatISO, parseISO } from "date-fns";

import type { Cycle, ProgramSession, Workout, WorkoutSetFormValues } from "@/lib/types";

export function calculateCycleEndDate(startDate: string) {
  return formatISO(addDays(parseISO(startDate), 55), { representation: "date" });
}

export interface PlannedSession {
  cycle: Cycle;
  weekNumber: number;
  sessionIndex: number;
  session: ProgramSession;
}

export function plannedWorkoutHref(cycleId: string, weekNumber: number, sessionIndex: number) {
  return `/workouts?${new URLSearchParams({ cycle: cycleId, week: String(weekNumber), session: String(sessionIndex) })}`;
}

/** Resolve links only against the athlete's loaded cycle data. */
export function resolvePlannedSession(
  cycles: Cycle[],
  cycleId: string | null,
  weekValue: string | null,
  sessionValue: string | null,
): PlannedSession | null {
  if (!cycleId || !weekValue || sessionValue === null || !/^\d+$/.test(weekValue) || !/^\d+$/.test(sessionValue)) return null;
  const cycle = cycles.find((entry) => entry.id === cycleId);
  const weekNumber = Number(weekValue);
  const sessionIndex = Number(sessionValue);
  const session = cycle?.program_template.find((week) => week.week_number === weekNumber)?.sessions[sessionIndex];
  return cycle && session ? { cycle, weekNumber, sessionIndex, session } : null;
}

export function isSessionRecorded(plan: PlannedSession, workouts: Workout[]) {
  return workouts.some((workout) =>
    workout.cycle_id === plan.cycle.id && workout.week_number === plan.weekNumber &&
    workout.day_label === plan.session.day_label,
  );
}

export function getWeekSessionProgress(cycle: Cycle | null | undefined, weekNumber: number, workouts: Workout[]) {
  const sessions = cycle?.program_template.find((week) => week.week_number === weekNumber)?.sessions ?? [];
  const plans = cycle ? sessions.map((session, sessionIndex) => ({ cycle, weekNumber, sessionIndex, session })) : [];
  const completed = plans.filter((plan) => isSessionRecorded(plan, workouts)).length;
  return {
    completed,
    total: sessions.length,
    percent: sessions.length ? Math.round(completed / sessions.length * 100) : 0,
    next: plans.find((plan) => !isSessionRecorded(plan, workouts)) ?? null,
  };
}

/** Only seed explicit sets/reps; percentages and free text never invent an actual load or RPE. */
export function plannedSessionSets(session: ProgramSession): WorkoutSetFormValues[] {
  return session.exercises.filter((exercise) => !/\bmin\b/i.test(exercise.prescription)).map((exercise) => {
    const prescription = exercise.prescription.match(/(\d+)\s*[x×]\s*(\d+)/i);
    return {
      exercise_name: exercise.name,
      weight: 0,
      sets: prescription ? Number(prescription[1]) : 1,
      reps: prescription ? Number(prescription[2]) : 1,
      rpe: undefined,
      notes: "",
      video_url: "",
    };
  });
}
