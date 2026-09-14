import assert from "node:assert/strict";
import test from "node:test";
import { getCurrentWeek, getDashboardSnapshot, getLiftProgressChart, getLiftRmSummary, getRecoveryStatus, getWeeklyRecoveryChart, getWeeklyVolumeChart } from "../src/lib/metrics";
import type { AppDataset, Cycle, RecoveryLog, Workout } from "../src/lib/types";

function cycle(start = "2026-09-09", end = "2026-12-01"): Cycle {
  return { id: start, user_id: "local", name: "Cycle", start_date: start, end_date: end,
    goal: "Strength", initial_squat_rm: 180, initial_bench_rm: 120, initial_deadlift_rm: 165,
    initial_bodyweight: 80, is_active: false, program_template: [] };
}

function workout(date: string, estimates: number[]): Workout {
  return { id: date, user_id: "local", date, week_number: 1, day_label: "A", title: "Squat",
    sets: estimates.map((estimated_1rm, index) => ({ id: `${date}-${index}`, workout_id: date,
      exercise_name: "Sentadilla", weight: 100, sets: 3, reps: 5, rpe: 8,
      volume: 1500, estimated_1rm, best_set_weight: 100 })) };
}

function recovery(date: string, energy = 8): RecoveryLog {
  return { id: date, user_id: "local", date, bodyweight: 80, sleep_hours: 8,
    sleep_quality: 8, energy, stress: 2, low_back_pain: 0, knee_pain: 0,
    shoulder_pain: 0, mobility_done: false };
}

test("cycle weeks follow seven days from the start and allow twelve weeks", () => {
  assert.equal(getCurrentWeek(cycle(), new Date(2026, 8, 8)), 1);
  assert.equal(getCurrentWeek(cycle(), new Date(2026, 8, 13)), 1);
  assert.equal(getCurrentWeek(cycle(), new Date(2026, 8, 16)), 2);
  assert.equal(getCurrentWeek(cycle(), new Date(2026, 11, 10)), 12);
  assert.equal(getCurrentWeek(cycle("2026-09-09", "2026-10-06"), new Date(2026, 10, 1)), 4);
});

test("latest e1RM uses session date and best session set, separating measured and historical max", () => {
  const result = getLiftRmSummary([workout("2026-09-01", [200]), workout("2026-09-10", [170, 180])], [], "squat");
  assert.deepEqual(result, { measuredRm: null, estimatedRm: 180, bestEstimatedRm: 200 });
});

test("e1RM chart keeps measured records separate", () => {
  const prs = [{ id: "pr", user_id: "local", date: "2026-09-10", exercise: "Sentadilla", weight: 200, bodyweight: 80, successful: true, is_pr: true }];
  assert.equal(getLiftProgressChart([workout("2026-09-10", [180])], prs)[0].squat, 180);
  assert.equal(getLiftRmSummary([], prs, "squat").measuredRm, 200);
});

test("measured RM summary uses the best successful historical attempt", () => {
  const earlier = { id: "earlier", user_id: "local", date: "2026-08-10", exercise: "Sentadilla", weight: 200, bodyweight: 80, successful: true, is_pr: true };
  const recent = { ...earlier, id: "recent", date: "2026-09-10", weight: 180 };
  const failed = { ...recent, id: "failed", weight: 300, successful: false };
  assert.equal(getLiftRmSummary([], [earlier, recent, failed], "squat").measuredRm, 200);
});

test("dashboard does not mutate cycles and excludes unsuccessful PR attempts", () => {
  const cycles = Object.freeze([cycle("2026-01-01", "2026-02-25"), cycle()]);
  const data: AppDataset = { profile: null, cycles: cycles as unknown as Cycle[], workouts: [], recoveryLogs: [], weeklyReviews: [],
    prs: [{ id: "failed", user_id: "local", date: "2026-09-10", exercise: "Sentadilla", weight: 300, bodyweight: 80, successful: false, is_pr: true }] };
  const snapshot = getDashboardSnapshot(data);
  assert.equal(snapshot.activeCycle?.start_date, "2026-09-09");
  assert.equal(snapshot.lastPR, null);
  assert.equal(data.cycles[0].start_date, "2026-01-01");
});

test("weekly charts remain chronological and do not merge the same month/day across years", () => {
  const chart = getWeeklyVolumeChart([workout("2032-01-05", [180]), workout("2026-01-05", [170]), workout("2026-01-06", [175])]);
  assert.equal(chart.length, 2);
  assert.equal(chart[0].volume, 3000);
  assert.match(chart[0].label, /2026/);
  assert.match(chart[1].label, /2032/);
  const recoveryChart = getWeeklyRecoveryChart([recovery("2032-01-05"), recovery("2026-01-05")], "sleep");
  assert.equal(recoveryChart.length, 2);
  assert.match(recoveryChart[0].label, /2026/);
});

test("readiness includes today and preceding six days, excluding future and old records", () => {
  const status = getRecoveryStatus([recovery("2026-09-07"), recovery("2026-09-06", 1), recovery("2026-09-14", 1)], new Date(2026, 8, 13, 23, 59));
  assert.equal(status.score, 80);
  assert.equal(getRecoveryStatus([recovery("2026-09-14")], new Date(2026, 8, 13)).label, "Sin datos");
});
