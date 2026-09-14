import assert from "node:assert/strict";
import test from "node:test";
import { parseRequest } from "../src/lib/api-validation";
import { cycleSchema, prSchema, recoverySchema, weeklyReviewSchema, workoutSchema, workoutSetSchema } from "../src/lib/validators";

const set = { exercise_name: "Sentadilla", weight: 100, sets: 3, reps: 5, rpe: 8 };
const workout = { date: "2026-09-14", week_number: 1, day_label: "Día A", title: "Sentadilla", sets: [set] };

function request(body: string) {
  return new Request("http://localhost/api/workouts", { method: "POST", headers: { "Content-Type": "application/json" }, body });
}

test("API parser returns a readable 400 for malformed JSON", async () => {
  const result = await parseRequest(request('{"date":'), workoutSchema);
  assert.equal(result.error?.status, 400);
  assert.match((await result.error?.json()).error, /JSON válido/);
  assert.equal(result.data, undefined);
});

test("API parser returns 400 for invalid form data", async () => {
  const result = await parseRequest(request(JSON.stringify({ ...workout, sets: [] })), workoutSchema);
  assert.equal(result.error?.status, 400);
  assert.match((await result.error?.json()).error, /ejercicio/);
  assert.equal(result.data, undefined);
});

test("API parser returns validated and coerced data for valid forms", async () => {
  const result = await parseRequest(request(JSON.stringify({ ...workout, sets: [{ ...set, weight: "100" }] })), workoutSchema);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.data, workout);
});

test("date fields reject impossible calendar dates in every dated form", () => {
  const dateFields = [
    workoutSchema.shape.date,
    cycleSchema.shape.start_date,
    prSchema.shape.date,
    recoverySchema.shape.date,
    weeklyReviewSchema.shape.review_date,
  ];
  for (const schema of dateFields) {
    assert.equal(schema.safeParse("2026-02-30").success, false);
    assert.equal(schema.safeParse("2026-02-29").success, false);
    assert.equal(schema.safeParse("2026-13-01").success, false);
    assert.equal(schema.safeParse("2028-02-29").success, true);
  }
});

test("workout sets and repetitions require positive integers", () => {
  assert.equal(workoutSetSchema.safeParse({ ...set, sets: 1.5 }).success, false);
  assert.equal(workoutSetSchema.safeParse({ ...set, reps: 2.5 }).success, false);
  assert.equal(workoutSetSchema.safeParse({ ...set, sets: 0 }).success, false);
  assert.equal(workoutSetSchema.safeParse({ ...set, reps: 0 }).success, false);
  assert.equal(workoutSetSchema.safeParse(set).success, true);
});
