"use client";

import { HeartPulse, MoonStar, Scale, Shield } from "lucide-react";

import { RecoveryForm } from "@/components/forms/recovery-form";
import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { formatNumber } from "@/lib/utils";

export default function RecoveryPage() {
  const { dashboard, recoveryStatus, data } = useAppData();
  const { t } = useI18n();
  const latestRecovery = [...data.recoveryLogs].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  )[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("recovery")}
        title={t("recoveryPulse")}
        description={t("recoveryDescription")}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Scale}
          label={t("currentBodyweight")}
          value={`${formatNumber(dashboard.currentBodyweight, 1)} kg`}
          accent="success"
        />
        <MetricCard
          icon={MoonStar}
          label={t("sleepAverage")}
          value={`${formatNumber(dashboard.averageSleep, 1)} h`}
          accent="warning"
        />
        <MetricCard
          icon={HeartPulse}
          label={t("lowBackAverage")}
          value={`${formatNumber(dashboard.averageLowBackPain, 1)}/10`}
          accent="danger"
        />
        <MetricCard
          icon={Shield}
          label={t("recoveryStatus")}
          value={`${recoveryStatus.score}/100`}
          helper={recoveryStatus.label}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <RecoveryForm />

        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">{t("recoveryStatus")}</h3>
          {latestRecovery ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  {t("sleepQuality")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {latestRecovery.sleep_quality}/10
                </p>
              </div>
              <div className="rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  {t("energy")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {latestRecovery.energy}/10
                </p>
              </div>
              <div className="rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  {t("stress")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {latestRecovery.stress}/10
                </p>
              </div>
              <div className="rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  {t("mobilityDone")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {latestRecovery.mobility_done ? t("yes") : t("no")}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--foreground-muted)]">{t("noDataDescription")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
