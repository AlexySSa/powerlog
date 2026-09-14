"use client";

import {
  Activity,
  BarChart3,
  Database,
  HeartPulse,
  Medal,
  Scale,
  Shield,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const featureIcons = [Medal, Activity, HeartPulse, BarChart3];
const metricIcons = [Scale, Trophy, Shield, Database];

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();

  const features = [
    t("cycleGeneratorDescription"),
    t("workoutDescription"),
    t("recoveryDescription"),
    t("warLogDescription"),
  ];

  const quickMetrics = [
    t("currentCycle"),
    t("currentBodyweight"),
    t("recoveryStatus"),
    "Tus datos",
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--card)]/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-4xl uppercase tracking-[0.14em] text-[var(--foreground)]">
            PowerLog
          </p>
          <p className="text-sm text-[var(--foreground-muted)]">8 Weeks</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Link href="/auth">
            <Button variant="ghost" className="w-full sm:w-auto">
              {t("signIn")}
            </Button>
          </Link>
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button className="w-full sm:w-auto">{user ? t("enterApp") : t("startNow")}</Button>
          </Link>
        </div>
      </header>

      <section className="grid flex-1 gap-6 py-8 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden p-6 md:p-8">
          <Badge>{t("heroTag")}</Badge>
          <h1 className="font-heading mt-6 max-w-4xl text-5xl uppercase leading-none tracking-[0.08em] text-[var(--foreground)] sm:text-7xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--foreground-muted)] md:text-lg">
            {t("heroDescription")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={user ? "/dashboard" : "/auth"}>
              <Button size="lg" className="w-full sm:w-auto">
                {user ? t("enterApp") : t("startNow")}
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Entrar sin cuenta
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = featureIcons[index];
              return (
                <div
                  key={feature}
                  className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <Icon className="size-6 text-[var(--accent)]" />
                  <p className="mt-4 text-sm leading-7 text-[var(--foreground-muted)]">
                    {feature}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <p className="text-sm text-[var(--foreground-muted)]">Una vista de tu entrenamiento</p>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">Valores ilustrativos. Tus métricas se calculan con tus registros.</p>
            <div className="mt-5 grid gap-3">
              {quickMetrics.map((metric, index) => {
                const Icon = metricIcons[index];
                return (
                  <div
                    key={metric}
                    className="flex items-center gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                  >
                    <div className="rounded-2xl bg-[var(--surface-strong)] p-3 text-[var(--accent)]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--foreground-soft)]">{metric}</p>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {index === 0 && "8-week block"}
                        {index === 1 && "82.4 kg"}
                        {index === 2 && "84/100"}
                        {index === 3 && "Guardados en tu navegador"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              Planifica. Registra. Revisa.
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Tu próximo bloque empieza aquí
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-muted)]">
              Usa PowerLog para planificar tus levantamientos y revisar tu progresión,
              mientras sigues registrando tu entrenamiento general en Hevy.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[var(--foreground-muted)]">
              <li>Empieza sin cuenta con un perfil local o un ciclo de demostración.</li>
              <li>Consulta la sesión programada y registra lo que completaste.</li>
              <li>Revisa estimaciones de fuerza, volumen y recuperación.</li>
              <li>Conserva tus registros en este navegador; también puedes usar una cuenta en el servidor.</li>
            </ul>
          </Card>
        </div>
      </section>
    </main>
  );
}
