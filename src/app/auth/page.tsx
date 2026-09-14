"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/forms/auth-form";
import { LocalSetupForm } from "@/components/forms/local-setup-form";

export default function AuthPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
        <ArrowLeft className="size-4" /> Volver
      </Link>
      <header className="my-8">
        <p className="text-sm uppercase tracking-widest text-[var(--accent)]">PowerLog</p>
        <h1 className="font-heading mt-3 text-5xl uppercase tracking-wide sm:text-6xl">Empieza tu próximo ciclo</h1>
        <p className="mt-4 text-[var(--foreground-muted)]">Elige guardar en este navegador o entrar con tu cuenta.</p>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <LocalSetupForm />
        <div>
          <h2 className="mb-3 text-lg font-semibold">Acceso con cuenta</h2>
          <p className="mb-5 text-sm leading-6 text-[var(--foreground-muted)]">Para guardar tus registros en el servidor. Requiere que el servicio de cuentas esté configurado.</p>
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
