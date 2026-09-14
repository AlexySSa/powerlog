import { format } from "date-fns";
import { z } from "zod";

import { calculateCycleEndDate } from "./cycle-utils";
import { createCycleTemplate } from "./program";
import { convertWeight, estimateOneRepMax } from "./training-math";
import type { AppDataset, CycleFormValues, PRFormValues, RecoveryFormValues, SettingsFormValues, WeeklyReviewFormValues, WorkoutFormValues } from "@/lib/types";
import { cycleSchema, prSchema, recoverySchema, settingsSchema, weeklyReviewSchema, workoutSchema, workoutSetSchema } from "./validators";

export const LOCAL_DATA_KEY = "powerlog-local-data";
export const LOCAL_MODE_KEY = "powerlog-data-mode";
export const LOCAL_USER_ID = "local-athlete";
export const LOCAL_DATA_VERSION = 1;

const row = { id: z.string().min(1), user_id: z.literal(LOCAL_USER_ID), created_at: z.string().optional() };
const date = z.iso.date();
const programWeek = z.object({
  week_number: z.number(), phase: z.string(), goal: z.string(),
  sessions: z.array(z.object({
    day_label: z.string(), focus: z.string(), notes: z.string().optional(),
    exercises: z.array(z.object({ name: z.string(), prescription: z.string() }).passthrough()),
  }).passthrough()),
}).passthrough();

const datasetSchema = z.object({
  profile: settingsSchema.extend({ id: z.literal(LOCAL_USER_ID), email: z.string(), current_bodyweight: z.number().positive().nullable().optional(), created_at: z.string().optional() }).passthrough(),
  cycles: z.array(cycleSchema.extend({ ...row, start_date: date, end_date: date, is_active: z.boolean(), program_template: z.array(programWeek) }).passthrough()),
  workouts: z.array(workoutSchema.extend({
    ...row, date,
    sets: z.array(workoutSetSchema.extend({ id: z.string(), workout_id: z.string(), volume: z.number().nonnegative(), estimated_1rm: z.number().nonnegative(), best_set_weight: z.number().nonnegative(), created_at: z.string().optional() }).passthrough()),
  }).passthrough()),
  recoveryLogs: z.array(recoverySchema.extend({ ...row, date }).passthrough()),
  prs: z.array(prSchema.extend({ ...row, date }).passthrough()),
  weeklyReviews: z.array(weeklyReviewSchema.extend({ ...row, review_date: date }).passthrough()),
}).passthrough();

type StorageAccess = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStorage(): StorageAccess {
  try {
    return window.localStorage;
  } catch {
    throw new Error("El navegador bloquea el almacenamiento local. Habilítalo para guardar tu entrenamiento.");
  }
}

export function readLocalMode(storage: StorageAccess = browserStorage()) {
  try {
    return storage.getItem(LOCAL_MODE_KEY) === "local";
  } catch {
    throw new Error("No se puede acceder al almacenamiento de este navegador.");
  }
}

export function setLocalMode(active: boolean, storage: StorageAccess = browserStorage()) {
  try {
    if (active) storage.setItem(LOCAL_MODE_KEY, "local");
    else storage.removeItem(LOCAL_MODE_KEY);
  } catch {
    throw new Error("No se pudo guardar el modo de acceso. Revisa el almacenamiento del navegador.");
  }
}

export function readLocalDataset(storage: StorageAccess = browserStorage()): AppDataset | null {
  let raw: string | null;
  try {
    raw = storage.getItem(LOCAL_DATA_KEY);
  } catch {
    throw new Error("No se pueden leer los datos locales. Revisa los permisos del navegador.");
  }
  if (!raw) return null;
  try {
    const envelope = z.object({ version: z.literal(LOCAL_DATA_VERSION), data: datasetSchema }).parse(JSON.parse(raw));
    return envelope.data as AppDataset;
  } catch {
    throw new Error("Los datos locales están dañados o pertenecen a otra versión. No se han borrado ni reemplazado. Conserva una copia antes de restablecer el almacenamiento.");
  }
}

export function writeLocalDataset(data: AppDataset, storage: StorageAccess = browserStorage()) {
  const parsed = datasetSchema.safeParse(data);
  if (!parsed.success) throw new Error("No se guardó: los datos locales no tienen un formato válido.");
  try {
    storage.setItem(LOCAL_DATA_KEY, JSON.stringify({ version: LOCAL_DATA_VERSION, data: parsed.data }));
  } catch {
    throw new Error("No se guardó el cambio: el almacenamiento está lleno o bloqueado. Libera espacio o habilita el almacenamiento y vuelve a intentarlo.");
  }
}

export interface LocalSetupValues {
  fullName: string;
  bodyweight: number;
  squatRm: number;
  benchRm: number;
  deadliftRm: number;
  demo: boolean;
}

export function createLocalDataset(values: LocalSetupValues): AppDataset {
  const profile = settingsSchema.parse({ full_name: values.fullName.trim(), preferred_language: "es", preferred_theme: "dark" });
  const bodyweight = z.number().positive().parse(values.bodyweight);
  const data: AppDataset = {
    profile: { ...profile, id: LOCAL_USER_ID, email: "", current_bodyweight: bodyweight, created_at: new Date().toISOString() },
    cycles: [], workouts: [], recoveryLogs: [], prs: [], weeklyReviews: [],
  };
  return addLocalCycle(data, {
    name: values.demo ? "Demo · PowerLog 8 semanas" : "Mi primer ciclo · 8 semanas",
    start_date: format(new Date(), "yyyy-MM-dd"),
    goal: values.demo ? "Explorar PowerLog con marcas de ejemplo: 405 / 275 / 365 lb." : "Mejorar mis marcas con técnica y recuperación constantes.",
    initial_bodyweight: bodyweight,
    initial_squat_rm: values.demo ? convertWeight(405, "lb", "kg") : values.squatRm,
    initial_bench_rm: values.demo ? convertWeight(275, "lb", "kg") : values.benchRm,
    initial_deadlift_rm: values.demo ? convertWeight(365, "lb", "kg") : values.deadliftRm,
  });
}

function metadata() {
  return { id: crypto.randomUUID(), user_id: LOCAL_USER_ID, created_at: new Date().toISOString() };
}

function requireCycle(data: AppDataset, cycleId?: string) {
  if (cycleId && !data.cycles.some((cycle) => cycle.id === cycleId)) {
    throw new Error("El ciclo seleccionado ya no está disponible. Actualiza la página y selecciona otro.");
  }
}

export function addLocalCycle(data: AppDataset, values: CycleFormValues): AppDataset {
  const payload = cycleSchema.extend({ start_date: date }).parse(values);
  return {
    ...data,
    cycles: [{ ...payload, ...metadata(), end_date: calculateCycleEndDate(payload.start_date), is_active: true, program_template: createCycleTemplate(data.profile?.preferred_language ?? "es") }, ...data.cycles.map((cycle) => ({ ...cycle, is_active: false }))],
  };
}

export function addLocalWorkout(data: AppDataset, values: WorkoutFormValues): AppDataset {
  const payload = workoutSchema.extend({ date }).parse(values);
  requireCycle(data, payload.cycle_id);
  const meta = metadata();
  return { ...data, workouts: [{ ...payload, ...meta, sets: payload.sets.map((entry) => ({
    ...entry, id: crypto.randomUUID(), workout_id: meta.id,
    volume: Number((entry.weight * entry.sets * entry.reps).toFixed(1)),
    estimated_1rm: estimateOneRepMax(entry.weight, entry.reps, entry.rpe), best_set_weight: entry.weight,
  })) }, ...data.workouts] };
}

export function addLocalRecovery(data: AppDataset, values: RecoveryFormValues): AppDataset {
  const payload = recoverySchema.extend({ date }).parse(values);
  const logs = [{ ...payload, ...metadata() }, ...data.recoveryLogs];
  const latest = [...logs].sort((a, b) => b.date.localeCompare(a.date))[0];
  return { ...data, recoveryLogs: logs, profile: data.profile ? { ...data.profile, current_bodyweight: latest.bodyweight } : null };
}

export function addLocalPR(data: AppDataset, values: PRFormValues): AppDataset {
  const payload = prSchema.extend({ date }).parse(values);
  requireCycle(data, payload.cycle_id);
  return { ...data, prs: [{ ...payload, ...metadata() }, ...data.prs] };
}

export function addLocalReview(data: AppDataset, values: WeeklyReviewFormValues): AppDataset {
  const payload = weeklyReviewSchema.extend({ review_date: date }).parse(values);
  requireCycle(data, payload.cycle_id);
  return { ...data, weeklyReviews: [{ ...payload, ...metadata() }, ...data.weeklyReviews] };
}

export function setLocalPreferences(data: AppDataset, values: SettingsFormValues): AppDataset {
  if (!data.profile) throw new Error("No hay un perfil local. Vuelve a entrar en modo local.");
  return { ...data, profile: { ...data.profile, ...settingsSchema.parse(values) } };
}

export function mutateLocalDataset(update: (data: AppDataset) => AppDataset, storage: StorageAccess = browserStorage()) {
  const data = readLocalDataset(storage);
  if (!data) throw new Error("No se encontraron los datos locales. Vuelve a entrar desde la pantalla de acceso.");
  const next = update(data);
  writeLocalDataset(next, storage);
  return next;
}
