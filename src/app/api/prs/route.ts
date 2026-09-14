import { parseRequest } from "@/lib/api-validation";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/server-auth";
import { prSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = await parseRequest(request, prSchema);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  if (payload.cycle_id && !(await prisma.cycle.findFirst({
    where: { id: payload.cycle_id, userId: user.id },
    select: { id: true },
  }))) {
    return NextResponse.json({ error: "Ciclo no encontrado." }, { status: 404 });
  }

  await prisma.pR.create({
    data: {
      userId: user.id,
      cycleId: payload.cycle_id || null,
      date: new Date(payload.date),
      exercise: payload.exercise,
      weight: payload.weight,
      bodyweight: payload.bodyweight,
      videoUrl: payload.video_url ?? "",
      comments: payload.comments ?? "",
      isPr: payload.is_pr,
      successful: payload.successful,
    },
  });

  return NextResponse.json({ ok: true });
}
