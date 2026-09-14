"use client";

import { CycleForm } from "@/components/forms/cycle-form";
import { CycleProgram } from "@/components/sections/cycle-program";
import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";

export default function CyclesPage() {
  const { dashboard, data } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("cycle")}
        title={t("cycles")}
        description={t("cycleGeneratorDescription")}
      />

      <div className="grid items-start gap-10 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <details open={!dashboard.activeCycle} className="border-y border-[var(--border)] py-4">
            <summary className="section-title">Crear un nuevo bloque</summary>
            <div className="mt-5"><CycleForm /></div>
          </details>
          {dashboard.activeCycle ? (
            <Card className="p-5">
              <p className="text-sm text-[var(--foreground-muted)]">{t("currentCycle")}</p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {dashboard.activeCycle.name}
              </h3>
              <p className="mt-3 text-sm text-[var(--foreground-soft)]">
                {formatDate(dashboard.activeCycle.start_date)} - {formatDate(dashboard.activeCycle.end_date)}
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--foreground-muted)]">
                {dashboard.activeCycle.goal}
              </p>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <CycleProgram cycle={dashboard.activeCycle} />
        </div>
      </div>

      {data.cycles.length > 1 ? (
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Historial de ciclos</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.cycles.slice(1).map((cycle) => (
              <div key={cycle.id} className="rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-sm text-[var(--foreground-muted)]">
                  {formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{cycle.name}</p>
                <p className="mt-2 text-sm text-[var(--foreground-soft)]">{cycle.goal}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
