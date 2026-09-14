import { parseRequest } from "@/lib/api-validation";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/server-auth";
import { weeklyReviewSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = await parseRequest(request, weeklyReviewSchema);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  if (payload.cycle_id && !(await prisma.cycle.findFirst({
    where: { id: payload.cycle_id, userId: user.id },
    select: { id: true },
  }))) {
    return NextResponse.json({ error: "Ciclo no encontrado." }, { status: 404 });
  }

  await prisma.weeklyReview.create({
    data: {
      userId: user.id,
      cycleId: payload.cycle_id || null,
      weekNumber: payload.week_number,
      reviewDate: new Date(payload.review_date),
      weeklyFeeling: payload.weekly_feeling,
      sleptEnough: payload.slept_enough,
      recoveryQuality: payload.recovery_quality,
      painNotes: payload.pain_notes,
      improveNext: payload.improve_next,
      nextWeekGoal: payload.next_week_goal,
    },
  });

  return NextResponse.json({ ok: true });
}
