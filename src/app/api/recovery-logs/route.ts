import { parseRequest } from "@/lib/api-validation";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/server-auth";
import { recoverySchema } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = await parseRequest(request, recoverySchema);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  await prisma.recoveryLog.create({
    data: {
      userId: user.id,
      date: new Date(payload.date),
      bodyweight: payload.bodyweight,
      sleepHours: payload.sleep_hours,
      sleepQuality: payload.sleep_quality,
      energy: payload.energy,
      stress: payload.stress,
      lowBackPain: payload.low_back_pain,
      kneePain: payload.knee_pain,
      shoulderPain: payload.shoulder_pain,
      mobilityDone: payload.mobility_done,
      notes: payload.notes ?? "",
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      currentBodyweight: payload.bodyweight,
    },
  });

  return NextResponse.json({ ok: true });
}
