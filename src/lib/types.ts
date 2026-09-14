export type Locale = "es" | "en" | "de";
export type ThemeMode = "dark" | "light";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  preferred_language: Locale;
  preferred_theme: ThemeMode;
  current_bodyweight?: number | null;
  created_at?: string;
}

export interface ProgramExercise {
  name: string;
  prescription: string;
}

export interface ProgramSession {
  day_label: string;
  focus: string;
  notes?: string;
  exercises: ProgramExercise[];
}

export interface ProgramWeek {
  week_number: number;
  phase: string;
  goal: string;
  sessions: ProgramSession[];
}

export interface Cycle {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  goal: string;
  initial_squat_rm: number;
  initial_bench_rm: number;
  initial_deadlift_rm: number;
  initial_bodyweight: number;
  is_active: boolean;
  program_template: ProgramWeek[];
  created_at?: string;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_name: string;
  weight: number;
  sets: number;
  reps: number;
  rpe?: number | null;
  notes?: string | null;
  video_url?: string | null;
  volume: number;
  estimated_1rm: number;
  best_set_weight: number;
  created_at?: string;
}

export interface Workout {
  id: string;
  user_id: string;
  cycle_id?: string | null;
  date: string;
  week_number: number;
  day_label: string;
  title: string;
  notes?: string | null;
  created_at?: string;
  sets: WorkoutSet[];
}

export interface RecoveryLog {
  id: string;
  user_id: string;
  date: string;
  bodyweight: number;
  sleep_hours: number;
  sleep_quality: number;
  energy: number;
  stress: number;
  low_back_pain: number;
  knee_pain: number;
  shoulder_pain: number;
  mobility_done: boolean;
  notes?: string | null;
  created_at?: string;
}

export interface PRRecord {
  id: string;
  user_id: string;
  cycle_id?: string | null;
  date: string;
  exercise: string;
  weight: number;
  bodyweight: number;
  video_url?: string | null;
  comments?: string | null;
  is_pr: boolean;
  successful: boolean;
  created_at?: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  cycle_id?: string | null;
  week_number: number;
  review_date: string;
  weekly_feeling: string;
  slept_enough: string;
  recovery_quality: string;
  pain_notes: string;
  improve_next: string;
  next_week_goal: string;
  created_at?: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  helper?: string;
  accent?: "primary" | "success" | "warning" | "danger";
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface LiftChartPoint {
  label: string;
  squat?: number;
  bench?: number;
  deadlift?: number;
}

export interface WeeklyTrendPoint {
  label: string;
  volume?: number;
  sleep?: number;
  lowBackPain?: number;
}

export interface DashboardSnapshot {
  activeCycle?: Cycle | null;
  currentWeek: number;
  currentBodyweight: number | null;
  currentSquatRm: number | null;
  currentBenchRm: number | null;
  currentDeadliftRm: number | null;
  averageSleep: number | null;
  averageLowBackPain: number | null;
  lastPR?: PRRecord | null;
}

export interface AppDataset {
  profile: Profile | null;
  cycles: Cycle[];
  workouts: Workout[];
  recoveryLogs: RecoveryLog[];
  prs: PRRecord[];
  weeklyReviews: WeeklyReview[];
}

export interface CycleFormValues {
  name: string;
  start_date: string;
  goal: string;
  initial_squat_rm: number;
  initial_bench_rm: number;
  initial_deadlift_rm: number;
  initial_bodyweight: number;
}

export interface WorkoutSetFormValues {
  exercise_name: string;
  weight: number;
  sets: number;
  reps: number;
  rpe?: number;
  notes?: string;
  video_url?: string;
}

export interface WorkoutFormValues {
  cycle_id?: string;
  date: string;
  week_number: number;
  day_label: string;
  title: string;
  notes?: string;
  sets: WorkoutSetFormValues[];
}

export interface RecoveryFormValues {
  date: string;
  bodyweight: number;
  sleep_hours: number;
  sleep_quality: number;
  energy: number;
  stress: number;
  low_back_pain: number;
  knee_pain: number;
  shoulder_pain: number;
  mobility_done: boolean;
  notes?: string;
}

export interface PRFormValues {
  cycle_id?: string;
  date: string;
  exercise: string;
  weight: number;
  bodyweight: number;
  video_url?: string;
  comments?: string;
  is_pr: boolean;
  successful: boolean;
}

export interface WeeklyReviewFormValues {
  cycle_id?: string;
  week_number: number;
  review_date: string;
  weekly_feeling: string;
  slept_enough: string;
  recovery_quality: string;
  pain_notes: string;
  improve_next: string;
  next_week_goal: string;
}

export interface SettingsFormValues {
  full_name: string;
  preferred_language: Locale;
  preferred_theme: ThemeMode;
}
