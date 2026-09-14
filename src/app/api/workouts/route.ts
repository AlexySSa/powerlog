import { NextResponse } from "next/server";

import { calculateVolume } from "@/lib/metrics";
import { estimateOneRepMax } from "@/lib/training-math";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/server-auth";
import { workoutSchema } from "@/lib/validators";
import { parseRequest } from "@/lib/api-validation";

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = await parseRequest(request, workoutSchema);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  if (payload.cycle_id) {
    const cycle = await prisma.cycle.findFirst({
      where: { id: payload.cycle_id, userId: user.id },
      select: { id: true },
    });
    if (!cycle) return NextResponse.json({ error: "Ciclo no encontrado." }, { status: 404 });
  }

  await prisma.workout.create({
    data: {
      userId: user.id,
      cycleId: payload.cycle_id || null,
      date: new Date(payload.date),
      weekNumber: payload.week_number,
      dayLabel: payload.day_label,
      title: payload.title,
      notes: payload.notes ?? "",
      sets: {
        create: payload.sets.map((entry) => ({
          exerciseName: entry.exercise_name,
          weight: entry.weight,
          sets: entry.sets,
          reps: entry.reps,
          rpe: entry.rpe ?? null,
          notes: entry.notes ?? "",
          videoUrl: entry.video_url ?? "",
          volume: calculateVolume(entry.weight, entry.sets, entry.reps),
          estimated1rm: estimateOneRepMax(entry.weight, entry.reps, entry.rpe),
          bestSetWeight: entry.weight,
        })),
      },
    },
  });

  return NextResponse.json({ ok: true });
}
