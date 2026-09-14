import { parseRequest } from "@/lib/api-validation";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { persistSession, SessionUser } from "@/lib/server-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = await parseRequest(request, schema);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Correo o contrasena incorrectos." },
      { status: 401 },
    );
  }

  const validPassword = await bcrypt.compare(payload.password, user.passwordHash);

  if (!validPassword) {
    return NextResponse.json(
      { error: "Correo o contrasena incorrectos." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      preferred_language: user.preferredLanguage,
      preferred_theme: user.preferredTheme,
    },
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
