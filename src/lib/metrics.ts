import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
  startOfDay,
  subDays,
} from "date-fns";

import type {
  AppDataset,
  ChartPoint,
  Cycle,
  DashboardSnapshot,
  LiftChartPoint,
  PRRecord,
  WeeklyTrendPoint,
  Workout,
  WorkoutSet,
} from "@/lib/types";
import { estimateOneRepMax } from "./training-math";

/** Compatibility wrapper for Epley without recorded RPE. */
export function calculateEpley(weight: number, reps: number) {
  return estimateOneRepMax(weight, reps);
}

export function calculateVolume(weight: number, sets: number, reps: number) {
  return Number((weight * sets * reps).toFixed(1));
}

export function getBestSetLabel(entry: WorkoutSet) {
  return `${entry.weight} x ${entry.reps}`;
}

export function getCurrentWeek(cycle?: Cycle | null, today = new Date()) {
  if (!cycle) {
    return 1;
  }

  const start = parseISO(cycle.start_date);
  const end = parseISO(cycle.end_date);
  const duration = Math.max(1, Math.ceil((differenceInCalendarDays(end, start) + 1) / 7));
  // Training weeks are seven-day blocks anchored to the actual cycle start.
  return Math.min(duration, Math.max(1, Math.floor(differenceInCalendarDays(today, start) / 7) + 1));
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function detectLift(exerciseName: string) {
  const name = normalizeText(exerciseName);

  if (
    name.includes("sentadilla") ||
    name.includes("squat") ||
    name.includes("kniebeuge")
  ) {
    return "squat" as const;
  }

  if (
    name.includes("banca") ||
    name.includes("bench") ||
    name.includes("bankdrucken")
  ) {
    return "bench" as const;
  }

  if (
    name.includes("peso muerto") ||
    name.includes("deadlift") ||
    name.includes("kreuzheben")
  ) {
    return "deadlift" as const;
  }

  return null;
}

function latestSuccessfulPr(prs: PRRecord[], lift: "squat" | "bench" | "deadlift") {
  const matches = prs
    .filter((pr) => pr.successful && detectLift(pr.exercise) === lift)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return matches[0] ?? null;
}

export function getLiftRmSummary(
  workouts: Workout[],
  prs: PRRecord[],
  lift: "squat" | "bench" | "deadlift",
) {
  const sessions = [...workouts]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map((workout) => workout.sets
      .filter((set) => detectLift(set.exercise_name) === lift && Number.isFinite(set.estimated_1rm) && set.estimated_1rm > 0)
      .map((set) => set.estimated_1rm))
    .filter((values) => values.length > 0);
  return {
    measuredRm: prs.reduce<number | null>((best, pr) =>
      pr.successful && detectLift(pr.exercise) === lift && Number.isFinite(pr.weight) && pr.weight > 0
        ? Math.max(best ?? 0, pr.weight)
        : best, null),
    estimatedRm: sessions.length ? Math.max(...sessions[0]) : null,
    bestEstimatedRm: sessions.length ? Math.max(...sessions.flat()) : null,
  };
}

export function getDashboardSnapshot(data: AppDataset): DashboardSnapshot {
  const activeCycle =
    data.cycles.find((cycle) => cycle.is_active) ??
    [...data.cycles].sort((a, b) => +new Date(b.start_date) - +new Date(a.start_date))[0] ??
    null;

  const recentRecovery = [...data.recoveryLogs]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 7);

  const averageSleep =
    recentRecovery.length > 0
      ? Number(
          (
            recentRecovery.reduce((sum, item) => sum + item.sleep_hours, 0) /
            recentRecovery.length
          ).toFixed(1),
        )
      : null;

  const averageLowBackPain =
    recentRecovery.length > 0
      ? Number(
          (
            recentRecovery.reduce((sum, item) => sum + item.low_back_pain, 0) /
            recentRecovery.length
          ).toFixed(1),
        )
      : null;

  const latestBodyweight =
    [...data.recoveryLogs].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0]
      ?.bodyweight ??
    activeCycle?.initial_bodyweight ??
    null;

  return {
    activeCycle,
    currentWeek: getCurrentWeek(activeCycle),
    currentBodyweight: latestBodyweight,
    currentSquatRm:
      latestSuccessfulPr(data.prs, "squat")?.weight ??
      getLiftRmSummary(data.workouts, data.prs, "squat").estimatedRm ??
      activeCycle?.initial_squat_rm ??
      null,
    currentBenchRm:
      latestSuccessfulPr(data.prs, "bench")?.weight ??
      getLiftRmSummary(data.workouts, data.prs, "bench").estimatedRm ??
      activeCycle?.initial_bench_rm ??
      null,
    currentDeadliftRm:
      latestSuccessfulPr(data.prs, "deadlift")?.weight ??
      getLiftRmSummary(data.workouts, data.prs, "deadlift").estimatedRm ??
      activeCycle?.initial_deadlift_rm ??
      null,
    averageSleep,
    averageLowBackPain,
    lastPR: data.prs.filter((pr) => pr.successful && pr.is_pr).sort((a, b) => +new Date(b.date) - +new Date(a.date))[0] ?? null,
  };
}

export function getRecentWorkouts(workouts: Workout[], limit = 5) {
  return [...workouts].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, limit);
}

export function getBodyweightChart(logs: AppDataset["recoveryLogs"]): ChartPoint[] {
  return [...logs]
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .map((log) => ({
      label: format(parseISO(log.date), "MMM d"),
      value: log.bodyweight,
    }));
}

export function getLiftProgressChart(workouts: Workout[], prs: PRRecord[]): LiftChartPoint[] {
  // Keep the old argument for callers, but measured attempts must not be mixed
  // into a chart presented as estimated strength. See getLiftRmSummary for PRs.
  void prs;
  const bucket = new Map<string, LiftChartPoint>();

  for (const workout of workouts) {
    const key = workout.date;
    const item = bucket.get(key) ?? {
      label: format(parseISO(key), "MMM d"),
    };

    for (const set of workout.sets) {
      const lift = detectLift(set.exercise_name);
      if (!lift) {
        continue;
      }

      item[lift] = Math.max(item[lift] ?? 0, set.estimated_1rm);
    }

    bucket.set(key, item);
  }

  return [...bucket.entries()]
    .sort((a, b) => +new Date(a[0]) - +new Date(b[0]))
    .map(([, value]) => value);
}

export function getWeeklyVolumeChart(workouts: Workout[]): WeeklyTrendPoint[] {
  const bucket = new Map<string, number>();

  for (const workout of workouts) {
    const weekKey = format(startOfWeek(parseISO(workout.date), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const total = workout.sets.reduce((sum, entry) => sum + entry.volume, 0);
    bucket.set(weekKey, (bucket.get(weekKey) ?? 0) + total);
  }

  return [...bucket.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, volume]) => ({ label: format(parseISO(date), "MMM d, yyyy"), volume }));
}

export function getWeeklyRecoveryChart(
  logs: AppDataset["recoveryLogs"],
  type: "sleep" | "lowBackPain",
): WeeklyTrendPoint[] {
  const bucket = new Map<string, number[]>();

  for (const log of logs) {
    const weekKey = format(startOfWeek(parseISO(log.date), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const value = type === "sleep" ? log.sleep_hours : log.low_back_pain;
    bucket.set(weekKey, [...(bucket.get(weekKey) ?? []), value]);
  }

  return [...bucket.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({
    label: format(parseISO(date), "MMM d, yyyy"),
    [type]:
      values.length === 0
        ? undefined
        : Number((values.reduce((sum, item) => sum + item, 0) / values.length).toFixed(1)),
  }));
}

export function getRecoveryStatus(logs: AppDataset["recoveryLogs"], today = new Date()) {
  const lastDay = startOfDay(today);
  const firstDay = subDays(lastDay, 6);
  const recent = logs
    .filter((log) => {
      const day = startOfDay(parseISO(log.date));
      return day >= firstDay && day <= lastDay;
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  if (recent.length === 0) {
    return {
      score: 0,
      label: "Sin datos",
    };
  }

  const sleepScore = recent.reduce((sum, item) => sum + item.sleep_quality, 0) / recent.length;
  const energyScore = recent.reduce((sum, item) => sum + item.energy, 0) / recent.length;
  const painPenalty =
    recent.reduce((sum, item) => sum + item.low_back_pain + item.knee_pain + item.shoulder_pain, 0) /
    recent.length /
    3;

  const score = Math.max(0, Math.min(100, Math.round(sleepScore * 6 + energyScore * 4 - painPenalty * 5)));

  return {
    score,
    label: score >= 80 ? "Alta" : score >= 60 ? "Estable" : "Cuidar carga",
  };
}
