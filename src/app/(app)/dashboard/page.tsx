"use client";

import Link from "next/link";
import {
  Activity,
  BedDouble,
  Crown,
  Dumbbell,
  Scale,
  ShieldPlus,
  Swords,
} from "lucide-react";

import { TrendChartCard } from "@/components/charts/trend-chart-card";
import { RecentWorkoutsList } from "@/components/sections/recent-workouts-list";
import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { formatNumber } from "@/lib/utils";
import { getWeekSessionProgress, plannedWorkoutHref } from "@/lib/cycle-utils";

export default function DashboardPage() {
  const {
    data,
    dashboard,
    recentWorkouts,
    bodyweightChart,
    liftChart,
    weeklyVolumeChart,
    recoveryStatus,
  } = useAppData();
  const { t } = useI18n();
  const weekProgress = getWeekSessionProgress(dashboard.activeCycle, dashboard.currentWeek, data.workouts);
  const nextSession = weekProgress.next;
  const workoutHref = nextSession
    ? plannedWorkoutHref(nextSession.cycle.id, nextSession.weekNumber, nextSession.sessionIndex)
    : "/workouts";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("overview")}
        title={t("dashboard")}
        description={t("mobileHint")}
        action={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href={workoutHref} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)]">
              {nextSession ? "Comenzar próxima sesión" : t("logWorkout")}
            </Link>
            <a href="/recovery">
              <Button variant="secondary" className="w-full">
                {t("logRecovery")}
              </Button>
            </a>
          </div>
        }
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--foreground-muted)]">Próxima sesión de la semana {dashboard.currentWeek}</p>
            <h2 className="mt-2 text-xl font-semibold">{nextSession ? `${nextSession.session.day_label} · ${nextSession.session.focus}` : dashboard.activeCycle ? "Sesiones de la semana registradas" : "Crea tu primer ciclo"}</h2>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {weekProgress.total ? `${weekProgress.completed}/${weekProgress.total} sesiones registradas · ${weekProgress.percent}% de la semana` : "Planifica un bloque para ver aquí tus entrenamientos."}
            </p>
          </div>
          <Link href={nextSession ? workoutHref : "/cycles"} className="inline-flex min-h-12 items-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)]">
            {nextSession ? "Iniciar entrenamiento" : "Ver ciclos"}
          </Link>
        </div>
        {weekProgress.total > 0 ? <progress aria-label="Sesiones registradas de la semana" className="mt-4 h-2 w-full accent-[var(--accent)]" value={weekProgress.completed} max={weekProgress.total} /> : null}
        {nextSession ? (
          <ul className="mt-4 grid gap-2 text-sm text-[var(--foreground-muted)] sm:grid-cols-2">
            {nextSession.session.exercises.map((exercise, index) => <li key={index}>{exercise.name} · <span className="text-[var(--foreground)]">{exercise.prescription}</span></li>)}
          </ul>
        ) : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Crown}
          label={t("currentCycle")}
          value={dashboard.activeCycle?.name ?? "--"}
          helper={`${t("currentWeek")}: ${dashboard.currentWeek}`}
        />
        <MetricCard
          icon={Scale}
          label={t("currentBodyweight")}
          value={`${formatNumber(dashboard.currentBodyweight, 1)} kg`}
          accent="success"
        />
        <MetricCard
          icon={BedDouble}
          label={t("sleepAverage")}
          value={`${formatNumber(dashboard.averageSleep, 1)} h`}
          accent="warning"
        />
        <MetricCard
          icon={ShieldPlus}
          label={t("recoveryStatus")}
          value={`${recoveryStatus.score}/100`}
          helper={recoveryStatus.label}
          accent="primary"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Dumbbell}
          label={t("currentSquatRm")}
          value={`${formatNumber(dashboard.currentSquatRm, 1)} kg`}
        />
        <MetricCard
          icon={Activity}
          label={t("currentBenchRm")}
          value={`${formatNumber(dashboard.currentBenchRm, 1)} kg`}
          accent="success"
        />
        <MetricCard
          icon={Swords}
          label={t("currentDeadliftRm")}
          value={`${formatNumber(dashboard.currentDeadliftRm, 1)} kg`}
          accent="danger"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <TrendChartCard
          title={t("liftTrend")}
          description={t("programStatus")}
          data={liftChart}
          series={[
            { key: "squat", label: "Sentadilla", color: "#f97316" },
            { key: "bench", label: "Banca", color: "#22c55e" },
            { key: "deadlift", label: "Peso muerto", color: "#38bdf8" },
          ]}
        />
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">{t("lastPr")}</h3>
          {dashboard.lastPR ? (
            <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm text-[var(--foreground-muted)]">{dashboard.lastPR.date}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {dashboard.lastPR.exercise}
              </p>
              <p className="font-heading mt-3 text-4xl uppercase text-[var(--accent)]">
                {dashboard.lastPR.weight} kg
              </p>
              <p className="mt-3 text-sm text-[var(--foreground-soft)]">
                BW {dashboard.lastPR.bodyweight} kg ·{" "}
                {dashboard.lastPR.successful ? t("successful") : t("failedAttempt")}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--foreground-muted)]">{t("noDataDescription")}</p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                {t("lowBackAverage")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {formatNumber(dashboard.averageLowBackPain, 1)}/10
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                {t("weeklyVolume")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {weeklyVolumeChart.at(-1)?.volume?.toFixed(0) ?? "--"} kg
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TrendChartCard
          title={t("bodyweightTrend")}
          description={t("recoveryDescription")}
          data={bodyweightChart.map((item) => ({ label: item.label, bodyweight: item.value }))}
          series={[{ key: "bodyweight", label: "BW", color: "#f59e0b" }]}
          type="area"
        />
        <TrendChartCard
          title={t("weeklyVolume")}
          description={t("workoutDescription")}
          data={weeklyVolumeChart.map((item) => ({ label: item.label, volume: item.volume }))}
          series={[{ key: "volume", label: "Volumen", color: "#38bdf8" }]}
          type="bar"
        />
      </div>

      <div className="space-y-4">
        <PageHeader
          title={t("recentSessions")}
          description={t("workoutDescription")}
        />
        <RecentWorkoutsList workouts={recentWorkouts} />
      </div>
    </div>
  );
}
