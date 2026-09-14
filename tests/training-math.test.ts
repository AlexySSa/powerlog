import assert from "node:assert/strict";
import test from "node:test";
import { convertWeight, estimateOneRepMax, percentageChange, percentageOf, recommendProgression } from "../src/lib/training-math";

test("e1RM estimates use reps and RPE, keeping maximal singles equal to actual load", () => {
  assert.equal(estimateOneRepMax(100, 1, 10), 100);
  assert.equal(estimateOneRepMax(100, 5, 10), 116.7);
  assert.equal(estimateOneRepMax(100, 5, 8), 123.3);
  assert.equal(estimateOneRepMax(100, 5), 116.7);
  assert.equal(estimateOneRepMax(0, 5, 8), 0);
  assert.throws(() => estimateOneRepMax(-1, 5, 8), RangeError);
  assert.throws(() => estimateOneRepMax(100, 0, 8), RangeError);
  assert.throws(() => estimateOneRepMax(100, 2.5, 8), RangeError);
  assert.throws(() => estimateOneRepMax(100, 5, 11), RangeError);
  assert.throws(() => estimateOneRepMax(Infinity, 5, 8), RangeError);
});

test("kg/lb round trips preserve stored precision and demo loads", () => {
  assert.equal(convertWeight(405, "lb", "kg"), 183.70490985);
  assert.equal(convertWeight(275, "lb", "kg"), 124.73790175);
  assert.ok(Math.abs(convertWeight(365, "lb", "kg") - 165.56121505) < 1e-10);
  const pounds = convertWeight(convertWeight(405, "lb", "kg"), "kg", "lb");
  assert.ok(Math.abs(pounds - 405) < 1e-10);
  assert.equal(convertWeight(0, "kg", "lb"), 0);
  assert.throws(() => convertWeight(NaN, "kg", "lb"), RangeError);
});

test("percentages support TM prescriptions and missing baselines", () => {
  assert.equal(percentageOf(200, 75), 150);
  assert.equal(percentageOf(200, 102.5), 205);
  assert.equal(percentageChange(210, 200), 5);
  assert.equal(percentageChange(190, 200), -5);
  assert.equal(percentageChange(200, 0), null);
  assert.throws(() => percentageOf(100, -1), RangeError);
});

const baseline = {
  currentWeight: 100, actualRpe: 7, targetRpe: 8,
  completionRate: 1, readiness: "green" as const, e1rmChangePercent: 1,
};

test("progression proposes one modest increment and requires confirmation without mutation", () => {
  const input = Object.freeze({ ...baseline });
  const result = recommendProgression(input);
  assert.equal(result.action, "increase");
  assert.equal(result.suggestedWeight, 102.5);
  assert.equal(result.requiresConfirmation, true);
  assert.equal(input.currentWeight, 100);
  assert.equal(recommendProgression({ ...baseline, currentWeight: 20 }).action, "maintain");
  assert.equal(recommendProgression({ ...baseline, increment: 1.25 }).suggestedWeight, 101.25);
  assert.equal(recommendProgression({ ...baseline, currentWeight: 100.25, readiness: "yellow" }).suggestedWeight, 100.25);
});

test("progression holds with uncertain performance and reduces when fatigue or failures warrant it", () => {
  assert.equal(recommendProgression({ ...baseline, readiness: "yellow" }).action, "maintain");
  assert.equal(recommendProgression({ ...baseline, e1rmChangePercent: null }).action, "maintain");
  assert.equal(recommendProgression({ ...baseline, readiness: "red" }).suggestedWeight, 95);
  assert.equal(recommendProgression({ ...baseline, completionRate: 0.5 }).action, "reduce");
  assert.equal(recommendProgression({ ...baseline, actualRpe: 10 }).action, "reduce");
  assert.equal(recommendProgression({ ...baseline, e1rmChangePercent: -5 }).action, "reduce");
  assert.throws(() => recommendProgression({ ...baseline, completionRate: 100 }), RangeError);
  assert.throws(() => recommendProgression({ ...baseline, increment: 0 }), RangeError);
});
