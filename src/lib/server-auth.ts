import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { Locale, ThemeMode } from "@/lib/types";

const cookieName = "powerlog_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is missing.");
  }

  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  preferred_language: Locale;
  preferred_theme: ThemeMode;
}

function toSessionUser(user: {
  id: string;
  email: string;
  fullName: string;
  preferredLanguage: string;
  preferredTheme: string;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    preferred_language: (user.preferredLanguage as Locale) ?? "es",
    preferred_theme: (user.preferredTheme as ThemeMode) ?? "dark",
  };
}

async function signSessionToken(user: SessionUser) {
  return new SignJWT({
    userId: user.id,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(getAuthSecret());
}

export async function persistSession(
  response: NextResponse,
  user: SessionUser,
) {
  const token = await signSessionToken(user);

  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDurationSeconds,
  });
}

export function clearSession(response: NextResponse) {
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const userId = typeof payload.userId === "string" ? payload.userId : null;

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        preferredLanguage: true,
        preferredTheme: true,
      },
    });

    return user ? toSessionUser(user) : null;
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}
