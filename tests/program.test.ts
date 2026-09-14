import assert from "node:assert/strict";
import test from "node:test";
import { createCycleTemplate } from "../src/lib/program";

test("all locales provide accumulation, intensification, deload and controlled evaluation", () => {
  for (const locale of ["es", "en", "de"] as const) {
    const weeks = createCycleTemplate(locale);
    assert.deepEqual(weeks.map((week) => week.week_number), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(new Set(weeks.map((week) => week.phase)).size, 4);
    for (const week of weeks.slice(0, 3)) {
      assert.equal(week.phase, weeks[0].phase);
      assert.match(week.sessions[0].exercises[0].prescription, /4x5.*RPE 6–7.5/);
    }
    for (const week of weeks.slice(3, 6)) {
      assert.equal(week.phase, weeks[3].phase);
      assert.match(week.sessions[0].exercises[0].prescription, /4x3.*RPE 7–8.5/);
    }
    assert.match(weeks[6].sessions[0].exercises[0].prescription, /2x3.*RPE 5–6/);
    assert.equal(weeks[7].sessions.length, 3);
    assert.match(weeks[7].sessions[0].exercises[0].prescription, /3x2.*RPE 6–7/);
    assert.doesNotMatch(JSON.stringify(weeks), /102-105|PR day/);
    assert.ok(weeks[7].sessions.every((session) => session.notes?.includes("RPE 8")));
  }
});

test("editing one generated week does not mutate other weeks or future templates", () => {
  const weeks = createCycleTemplate("es");
  weeks[0].sessions[0].exercises[0].prescription = "manual";
  assert.notEqual(weeks[1].sessions[0].exercises[0].prescription, "manual");
  assert.notEqual(createCycleTemplate("es")[0].sessions[0].exercises[0].prescription, "manual");
});
