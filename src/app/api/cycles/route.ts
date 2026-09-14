import { parseRequest } from "@/lib/api-validation";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { calculateCycleEndDate } from "@/lib/cycle-utils";
import { prisma } from "@/lib/prisma";
import { createCycleTemplate } from "@/lib/program";
import { getSessionUser, unauthorizedResponse } from "@/lib/server-auth";
import { cycleSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = await parseRequest(request, cycleSchema);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.cycle.updateMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    await tx.cycle.create({
      data: {
        userId: user.id,
        name: payload.name,
        startDate: new Date(payload.start_date),
        endDate: new Date(calculateCycleEndDate(payload.start_date)),
        goal: payload.goal,
        initialSquatRm: payload.initial_squat_rm,
        initialBenchRm: payload.initial_bench_rm,
        initialDeadliftRm: payload.initial_deadlift_rm,
        initialBodyweight: payload.initial_bodyweight,
        isActive: true,
        programTemplate: createCycleTemplate(
          user.preferred_language,
        ) as unknown as Prisma.InputJsonValue,
      },
    });

  });

  return NextResponse.json({ ok: true });
}
