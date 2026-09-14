import { prisma } from "@/lib/prisma";
import {
  AppDataset,
  Profile,
  ProgramWeek,
  PRRecord,
  RecoveryLog,
  WeeklyReview,
  Workout,
  WorkoutSet,
} from "@/lib/types";

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function serializeProfile(user: {
  id: string;
  email: string;
  fullName: string;
  preferredLanguage: string;
  preferredTheme: string;
  currentBodyweight: number | null;
  createdAt: Date;
}): Profile {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    preferred_language: user.preferredLanguage as Profile["preferred_language"],
    preferred_theme: user.preferredTheme as Profile["preferred_theme"],
    current_bodyweight: user.currentBodyweight,
    created_at: user.createdAt.toISOString(),
  };
}

function serializeWorkoutSet(entry: {
  id: string;
  workoutId: string;
  exerciseName: string;
  weight: number;
  sets: number;
  reps: number;
  rpe: number | null;
  notes: string | null;
  videoUrl: string | null;
  volume: number;
  estimated1rm: number;
  bestSetWeight: number;
  createdAt: Date;
}): WorkoutSet {
  return {
    id: entry.id,
    workout_id: entry.workoutId,
    exercise_name: entry.exerciseName,
    weight: entry.weight,
    sets: entry.sets,
    reps: entry.reps,
    rpe: entry.rpe,
    notes: entry.notes,
    video_url: entry.videoUrl,
    volume: entry.volume,
    estimated_1rm: entry.estimated1rm,
    best_set_weight: entry.bestSetWeight,
    created_at: entry.createdAt.toISOString(),
  };
}

function serializeWorkout(entry: {
  id: string;
  userId: string;
  cycleId: string | null;
  date: Date;
  weekNumber: number;
  dayLabel: string;
  title: string;
  notes: string | null;
  createdAt: Date;
  sets: {
    id: string;
    workoutId: string;
    exerciseName: string;
    weight: number;
    sets: number;
    reps: number;
    rpe: number | null;
    notes: string | null;
    videoUrl: string | null;
    volume: number;
    estimated1rm: number;
    bestSetWeight: number;
    createdAt: Date;
  }[];
}): Workout {
  return {
    id: entry.id,
    user_id: entry.userId,
    cycle_id: entry.cycleId,
    date: toDateOnly(entry.date),
    week_number: entry.weekNumber,
    day_label: entry.dayLabel,
    title: entry.title,
    notes: entry.notes,
    created_at: entry.createdAt.toISOString(),
    sets: entry.sets.map(serializeWorkoutSet),
  };
}

function serializeRecovery(entry: {
  id: string;
  userId: string;
  date: Date;
  bodyweight: number;
  sleepHours: number;
  sleepQuality: number;
  energy: number;
  stress: number;
  lowBackPain: number;
  kneePain: number;
  shoulderPain: number;
  mobilityDone: boolean;
  notes: string | null;
  createdAt: Date;
}): RecoveryLog {
  return {
    id: entry.id,
    user_id: entry.userId,
    date: toDateOnly(entry.date),
    bodyweight: entry.bodyweight,
    sleep_hours: entry.sleepHours,
    sleep_quality: entry.sleepQuality,
    energy: entry.energy,
    stress: entry.stress,
    low_back_pain: entry.lowBackPain,
    knee_pain: entry.kneePain,
    shoulder_pain: entry.shoulderPain,
    mobility_done: entry.mobilityDone,
    notes: entry.notes,
    created_at: entry.createdAt.toISOString(),
  };
}

function serializePr(entry: {
  id: string;
  userId: string;
  cycleId: string | null;
  date: Date;
  exercise: string;
  weight: number;
  bodyweight: number;
  videoUrl: string | null;
  comments: string | null;
  isPr: boolean;
  successful: boolean;
  createdAt: Date;
}): PRRecord {
  return {
    id: entry.id,
    user_id: entry.userId,
    cycle_id: entry.cycleId,
    date: toDateOnly(entry.date),
    exercise: entry.exercise,
    weight: entry.weight,
    bodyweight: entry.bodyweight,
    video_url: entry.videoUrl,
    comments: entry.comments,
    is_pr: entry.isPr,
    successful: entry.successful,
    created_at: entry.createdAt.toISOString(),
  };
}

function serializeReview(entry: {
  id: string;
  userId: string;
  cycleId: string | null;
  weekNumber: number;
  reviewDate: Date;
  weeklyFeeling: string;
  sleptEnough: string;
  recoveryQuality: string;
  painNotes: string;
  improveNext: string;
  nextWeekGoal: string;
  createdAt: Date;
}): WeeklyReview {
  return {
    id: entry.id,
    user_id: entry.userId,
    cycle_id: entry.cycleId,
    week_number: entry.weekNumber,
    review_date: toDateOnly(entry.reviewDate),
    weekly_feeling: entry.weeklyFeeling,
    slept_enough: entry.sleptEnough,
    recovery_quality: entry.recoveryQuality,
    pain_notes: entry.painNotes,
    improve_next: entry.improveNext,
    next_week_goal: entry.nextWeekGoal,
    created_at: entry.createdAt.toISOString(),
  };
}

export async function getAppDataset(userId: string): Promise<AppDataset> {
  const [user, cycles, workouts, recoveryLogs, prs, weeklyReviews] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          preferredLanguage: true,
          preferredTheme: true,
          currentBodyweight: true,
          createdAt: true,
        },
      }),
      prisma.cycle.findMany({
        where: { userId },
        orderBy: { startDate: "desc" },
      }),
      prisma.workout.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        include: {
          sets: {
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      prisma.recoveryLog.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      }),
      prisma.pR.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      }),
      prisma.weeklyReview.findMany({
        where: { userId },
        orderBy: { reviewDate: "desc" },
      }),
    ]);

  return {
    profile: serializeProfile(user),
    cycles: cycles.map((entry) => ({
      id: entry.id,
      user_id: entry.userId,
      name: entry.name,
      start_date: toDateOnly(entry.startDate),
      end_date: toDateOnly(entry.endDate),
      goal: entry.goal,
      initial_squat_rm: entry.initialSquatRm,
      initial_bench_rm: entry.initialBenchRm,
      initial_deadlift_rm: entry.initialDeadliftRm,
      initial_bodyweight: entry.initialBodyweight,
      is_active: entry.isActive,
      program_template: entry.programTemplate as unknown as ProgramWeek[],
      created_at: entry.createdAt.toISOString(),
    })),
    workouts: workouts.map(serializeWorkout),
    recoveryLogs: recoveryLogs.map(serializeRecovery),
    prs: prs.map(serializePr),
    weeklyReviews: weeklyReviews.map(serializeReview),
  };
}
