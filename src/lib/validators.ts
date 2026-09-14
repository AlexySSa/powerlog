import { z } from "zod";

const dateSchema = z.iso.date("Selecciona una fecha válida.");

export const cycleSchema = z.object({
  name: z.string().min(3, "Escribe un nombre para el ciclo."),
  start_date: dateSchema,
  goal: z.string().min(8, "Describe el objetivo del ciclo."),
  initial_squat_rm: z.coerce.number().min(1, "Ingresa un 1RM válido."),
  initial_bench_rm: z.coerce.number().min(1, "Ingresa un 1RM válido."),
  initial_deadlift_rm: z.coerce.number().min(1, "Ingresa un 1RM válido."),
  initial_bodyweight: z.coerce.number().min(1, "Ingresa un peso válido."),
});

export const workoutSetSchema = z.object({
  exercise_name: z.string().min(2, "Agrega un ejercicio."),
  weight: z.coerce.number().min(0, "Ingresa un peso válido."),
  sets: z.coerce.number().int().min(1, "Mínimo 1 serie."),
  reps: z.coerce.number().int().min(1, "Mínimo 1 repetición."),
  rpe: z.coerce.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  video_url: z.string().url("Ingresa una URL válida.").or(z.literal("")).optional(),
});

export const workoutSchema = z.object({
  cycle_id: z.string().optional(),
  date: dateSchema,
  week_number: z.coerce.number().int().min(1).max(8),
  day_label: z.string().min(2, "Indica el día."),
  title: z.string().min(2, "Escribe un título."),
  notes: z.string().optional(),
  sets: z.array(workoutSetSchema).min(1, "Agrega al menos un ejercicio."),
});

export const recoverySchema = z.object({
  date: dateSchema,
  bodyweight: z.coerce.number().min(1, "Ingresa un peso válido."),
  sleep_hours: z.coerce.number().min(0).max(24),
  sleep_quality: z.coerce.number().min(1).max(10),
  energy: z.coerce.number().min(1).max(10),
  stress: z.coerce.number().min(1).max(10),
  low_back_pain: z.coerce.number().min(0).max(10),
  knee_pain: z.coerce.number().min(0).max(10),
  shoulder_pain: z.coerce.number().min(0).max(10),
  mobility_done: z.boolean(),
  notes: z.string().optional(),
});

export const prSchema = z.object({
  cycle_id: z.string().optional(),
  date: dateSchema,
  exercise: z.string().min(2, "Escribe el ejercicio."),
  weight: z.coerce.number().min(1, "Ingresa un peso válido."),
  bodyweight: z.coerce.number().min(1, "Ingresa el peso corporal."),
  video_url: z.string().url("Ingresa una URL válida.").or(z.literal("")).optional(),
  comments: z.string().optional(),
  is_pr: z.boolean(),
  successful: z.boolean(),
});

export const weeklyReviewSchema = z.object({
  cycle_id: z.string().optional(),
  week_number: z.coerce.number().int().min(1).max(8),
  review_date: dateSchema,
  weekly_feeling: z.string().min(8, "Cuéntanos cómo te sentiste."),
  slept_enough: z.string().min(3, "Completa este campo."),
  recovery_quality: z.string().min(3, "Completa este campo."),
  pain_notes: z.string().min(3, "Completa este campo."),
  improve_next: z.string().min(3, "Completa este campo."),
  next_week_goal: z.string().min(3, "Completa este campo."),
});

export const settingsSchema = z.object({
  full_name: z.string().min(2, "Ingresa tu nombre."),
  preferred_language: z.enum(["es", "en", "de"]),
  preferred_theme: z.enum(["dark", "light"]),
});
