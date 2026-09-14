import { parseRequest } from "@/lib/api-validation";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/server-auth";

const settingsSchema = z.object({
  full_name: z.string().min(2).optional(),
  preferred_language: z.enum(["es", "en", "de"]),
  preferred_theme: z.enum(["dark", "light"]),
});

export async function PATCH(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const parsed = await parseRequest(request, settingsSchema);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: payload.full_name ?? user.full_name,
      preferredLanguage: payload.preferred_language,
      preferredTheme: payload.preferred_theme,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      preferredLanguage: true,
      preferredTheme: true,
      currentBodyweight: true,
      createdAt: true,
    },
  });

  const response = NextResponse.json({
    profile: {
      id: updated.id,
      email: updated.email,
      full_name: updated.fullName,
      preferred_language: updated.preferredLanguage,
      preferred_theme: updated.preferredTheme,
      current_bodyweight: updated.currentBodyweight,
      created_at: updated.createdAt.toISOString(),
    },
  });

  return response;
}
