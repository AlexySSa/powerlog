import { parseRequest } from "@/lib/api-validation";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { serializeProfile } from "@/lib/server-data";
import { persistSession, SessionUser } from "@/lib/server-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
});

export async function POST(request: Request) {
  const parsed = await parseRequest(request, schema);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ese correo ya esta registrado." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      email: payload.email.toLowerCase(),
      passwordHash,
      fullName: payload.fullName,
      preferredLanguage: "es",
      preferredTheme: "dark",
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
    user: {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      preferred_language: user.preferredLanguage,
      preferred_theme: user.preferredTheme,
    },
    profile: serializeProfile(user),
  });

  await persistSession(response, {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    preferred_language: user.preferredLanguage as SessionUser["preferred_language"],
    preferred_theme: user.preferredTheme as SessionUser["preferred_theme"],
  });

  return response;
}
