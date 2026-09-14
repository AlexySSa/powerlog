import assert from "node:assert/strict";
import test from "node:test";
import { addLocalCycle, addLocalPR, addLocalRecovery, addLocalReview, addLocalWorkout, createLocalDataset, LOCAL_DATA_KEY, mutateLocalDataset, readLocalDataset, readLocalMode, setLocalMode, setLocalPreferences, writeLocalDataset } from "../src/lib/local-data";

function memoryStorage() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
  };
}

function initialData(demo = false) {
  return createLocalDataset({ fullName: "Atleta local", bodyweight: 80, squatRm: 180, benchRm: 120, deadliftRm: 170, demo });
}

test("local data round trips every record type and preferences without a server", () => {
  const storage = memoryStorage();
  let data = initialData();
  const cycle_id = data.cycles[0].id;
  data = addLocalWorkout(data, { cycle_id, date: "2026-09-13", week_number: 1, day_label: "Lunes", title: "Sentadilla", sets: [{ exercise_name: "Sentadilla", weight: 100, reps: 5, sets: 3, rpe: 8 }] });
  data = addLocalRecovery(data, { date: "2026-09-13", bodyweight: 81, sleep_hours: 8, sleep_quality: 8, energy: 8, stress: 2, low_back_pain: 0, knee_pain: 0, shoulder_pain: 0, mobility_done: true });
  data = addLocalPR(data, { cycle_id, date: "2026-09-13", exercise: "Sentadilla", weight: 182, bodyweight: 81, is_pr: true, successful: true });
  data = addLocalReview(data, { cycle_id, review_date: "2026-09-13", week_number: 1, weekly_feeling: "Buena semana de fuerza", slept_enough: "Sí, ocho horas", recovery_quality: "Buena", pain_notes: "Sin dolor", improve_next: "Técnica", next_week_goal: "Mantener constancia" });
  data = setLocalPreferences(data, { full_name: "Ana", preferred_language: "en", preferred_theme: "light" });
  writeLocalDataset(data, storage);
  const saved = readLocalDataset(storage);
  assert.deepEqual(saved, data);
  assert.equal(saved?.workouts[0].sets[0].estimated_1rm, 123.3);
  assert.equal(saved?.workouts[0].sets[0].volume, 1500);
  assert.equal(saved?.profile?.current_bodyweight, 81);
  assert.equal(saved?.profile?.preferred_language, "en");
});

test("local sign out preserves records and a fresh mutation reads the latest storage", () => {
  const storage = memoryStorage();
  writeLocalDataset(initialData(), storage);
  setLocalMode(true, storage);
  assert.equal(readLocalMode(storage), true);
  setLocalMode(false, storage);
  assert.equal(readLocalMode(storage), false);
  assert.ok(readLocalDataset(storage)?.profile);
  mutateLocalDataset((data) => setLocalPreferences(data, { full_name: "Nuevo nombre", preferred_language: "de", preferred_theme: "light" }), storage);
  mutateLocalDataset((data) => ({ ...data, prs: [] }), storage);
  assert.equal(readLocalDataset(storage)?.profile?.full_name, "Nuevo nombre");
});

test("corrupt and unsupported storage is preserved and cannot be overwritten by a mutation", () => {
  for (const raw of ["{invalid", JSON.stringify({ version: 99, data: initialData() }), JSON.stringify({ version: 1, data: { profile: null } })]) {
    const storage = memoryStorage();
    storage.setItem(LOCAL_DATA_KEY, raw);
    assert.throws(() => readLocalDataset(storage), /dañados o pertenecen a otra versión/);
    assert.throws(() => mutateLocalDataset(() => initialData(), storage));
    assert.equal(storage.getItem(LOCAL_DATA_KEY), raw);
  }
});

test("quota or denied access reports a clear error and does not mutate saved data", () => {
  const storage = memoryStorage();
  writeLocalDataset(initialData(), storage);
  const before = storage.getItem(LOCAL_DATA_KEY);
  const denied = { ...storage, setItem: () => { throw new Error("QuotaExceededError"); } };
  assert.throws(() => mutateLocalDataset((data) => setLocalPreferences(data, { full_name: "No guardado", preferred_language: "es", preferred_theme: "dark" }), denied), /No se guardó el cambio/);
  assert.equal(storage.getItem(LOCAL_DATA_KEY), before);
  assert.throws(() => readLocalDataset({ ...storage, getItem: () => { throw new Error("SecurityError"); } }), /No se pueden leer/);
});

test("new cycle deactivates the old cycle and rejects foreign cycle references", () => {
  const original = initialData();
  const data = addLocalCycle(original, { name: "Segundo ciclo", start_date: "2026-09-13", goal: "Mejorar fuerza y técnica", initial_bodyweight: 80, initial_squat_rm: 180, initial_bench_rm: 120, initial_deadlift_rm: 170 });
  assert.equal(data.cycles.filter((cycle) => cycle.is_active).length, 1);
  assert.equal(original.cycles[0].is_active, true);
  assert.equal(data.cycles[0].end_date, "2026-11-07");
  assert.throws(() => addLocalWorkout(data, { cycle_id: "missing", date: "2026-09-13", week_number: 1, day_label: "Lunes", title: "Fuerza", sets: [{ exercise_name: "Squat", weight: 100, sets: 1, reps: 1 }] }), /ya no está disponible/);
});

test("demo marks are converted from pounds and have no fabricated training history", () => {
  const data = initialData(true);
  assert.ok(data.cycles[0].name.startsWith("Demo"));
  assert.ok(Math.abs(data.cycles[0].initial_squat_rm - 183.70490985) < 0.000001);
  assert.ok(Math.abs(data.cycles[0].initial_bench_rm - 124.73790175) < 0.000001);
  assert.ok(Math.abs(data.cycles[0].initial_deadlift_rm - 165.56121505) < 0.000001);
  assert.equal(data.workouts.length, 0);
  assert.equal(data.prs.length, 0);
});
