import assert from "node:assert/strict";
import test from "node:test";
import { calculateCycleEndDate, getWeekSessionProgress, plannedSessionSets, plannedWorkoutHref, resolvePlannedSession } from "../src/lib/cycle-utils";
import type { Cycle, Workout } from "../src/lib/types";

const cycle: Cycle = {
  id: "cycle/one", user_id: "local", name: "Bloque", start_date: "2026-09-14", end_date: "2026-11-08",
  goal: "Fuerza", initial_squat_rm: 180, initial_bench_rm: 120, initial_deadlift_rm: 170,
  initial_bodyweight: 80, is_active: true,
  program_template: [{ week_number: 1, phase: "Acumulación", goal: "Técnica", sessions: [
    { day_label: "Lunes", focus: "Sentadilla", exercises: [
      { name: "Sentadilla", prescription: "4x6-8 (65–70%)" },
      { name: "Movilidad", prescription: "15-20 min" },
      { name: "Banca", prescription: "PR day" },
    ] },
    { day_label: "Miércoles", focus: "Banca", exercises: [{ name: "Banca", prescription: "3×5" }] },
  ] }],
};

test("planned links safely encode cycle IDs and resolve only existing sessions", () => {
  const url = new URL(plannedWorkoutHref(cycle.id, 1, 0), "https://powerlog.example");
  const params = url.searchParams;
  const plan = resolvePlannedSession([cycle], params.get("cycle"), params.get("week"), params.get("session"));
  assert.equal(plan?.session.focus, "Sentadilla");
  for (const [id, week, session] of [["other", "1", "0"], [cycle.id, "", "0"], [cycle.id, "1", "-1"], [cycle.id, "1", "0.5"], [cycle.id, "9", "0"], [cycle.id, "1", "2"]]) {
    assert.equal(resolvePlannedSession([cycle], id, week, session), null);
  }
  assert.equal(resolvePlannedSession([cycle], cycle.id, "1", null), null);
});

test("prescriptions seed repetition ranges without inventing recorded loads or RPE", () => {
  const sets = plannedSessionSets(cycle.program_template[0].sessions[0]);
  assert.equal(sets.length, 2);
  assert.equal(sets[0].sets, 4);
  assert.equal(sets[0].reps, 6);
  assert.equal(sets[0].weight, 0);
  assert.equal(sets[0].rpe, undefined);
  assert.equal(sets[1].sets, 1);
  assert.equal(sets[1].reps, 1);
  assert.equal(plannedSessionSets(cycle.program_template[0].sessions[1])[0].reps, 5);
});

test("weekly recorded-session progress excludes other cycles and duplicate logs", () => {
  const logged: Workout = { id: "log", user_id: "local", cycle_id: cycle.id, date: "2026-09-14", week_number: 1, day_label: "Lunes", title: "Sentadilla", sets: [] };
  const progress = getWeekSessionProgress(cycle, 1, [logged, { ...logged, id: "duplicate" }, { ...logged, cycle_id: "other", day_label: "Miércoles" }]);
  assert.equal(progress.completed, 1);
  assert.equal(progress.percent, 50);
  assert.equal(progress.next?.session.day_label, "Miércoles");
  assert.equal(getWeekSessionProgress(cycle, 1, [logged, { ...logged, day_label: "Miércoles" }]).next, null);
  assert.deepEqual(getWeekSessionProgress(null, 1, []), { completed: 0, total: 0, percent: 0, next: null });
});

test("eight-week cycle end date includes the starting day across month and year boundaries", () => {
  assert.equal(calculateCycleEndDate("2026-09-14"), "2026-11-08");
  assert.equal(calculateCycleEndDate("2026-12-15"), "2027-02-08");
});
