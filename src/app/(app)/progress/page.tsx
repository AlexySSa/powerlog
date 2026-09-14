"use client";

import { TrendChartCard } from "@/components/charts/trend-chart-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { getLiftRmSummary } from "@/lib/metrics";

const lifts = [
  { key: "squat", label: "Sentadilla", color: "#ef4444" },
  { key: "bench", label: "Banca", color: "#22c55e" },
  { key: "deadlift", label: "Peso muerto", color: "#38bdf8" },
] as const;

const weightLabel = (value: number | null) => value === null ? "Sin registros" : `${value} kg`;

export default function ProgressPage() {
  const {
    data,
    bodyweightChart,
    liftChart,
    weeklyVolumeChart,
    weeklySleepChart,
    weeklyLowBackChart,
  } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("progress")}
        title={t("mainLifts")}
        description="Observa cómo se mueven tu peso corporal, los básicos, el volumen y la recuperación a lo largo del ciclo."
      />

      <p className="text-sm text-[var(--foreground-muted)]">
        El e1RM es una estimación basada en peso, repeticiones y RPE; no equivale a un máximo comprobado.
        Las marcas reales se muestran por separado.
        Los ejercicios se agrupan por nombre del levantamiento e incluyen variantes; compara siempre la misma variante.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        {lifts.map((lift) => {
          const summary = getLiftRmSummary(data.workouts, data.prs, lift.key);
          return (
            <Card key={lift.key} className="p-5">
              <h2 className="text-lg font-semibold">{lift.label}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-[var(--foreground-muted)]">e1RM de la última sesión</dt><dd className="text-2xl font-semibold">{weightLabel(summary.estimatedRm)}</dd></div>
                <div><dt className="text-[var(--foreground-muted)]">Mejor e1RM histórico</dt><dd>{weightLabel(summary.bestEstimatedRm)}</dd></div>
                <div><dt className="text-emerald-400">Mejor marca real registrada</dt><dd>{weightLabel(summary.measuredRm)}</dd></div>
              </dl>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {lifts.map((lift) => (
          <TrendChartCard
            key={lift.key}
            title={`e1RM · ${lift.label}`}
            description="Mejor estimación de cada sesión, en kg."
            data={liftChart.filter((point) => point[lift.key] !== undefined)}
            series={[{ key: lift.key, label: `${lift.label} (kg)`, color: lift.color }]}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TrendChartCard
          title={t("bodyweightTrend")}
          description={t("recoveryDescription")}
          data={bodyweightChart.map((point) => ({ label: point.label, bodyweight: point.value }))}
          series={[{ key: "bodyweight", label: "BW", color: "#f59e0b" }]}
          type="area"
        />

        <TrendChartCard
          title={t("weeklyVolume")}
          description={t("workoutDescription")}
          data={weeklyVolumeChart.map((point) => ({ label: point.label, volume: point.volume }))}
          series={[{ key: "volume", label: "Volumen", color: "#38bdf8" }]}
          type="bar"
        />

        <TrendChartCard
          title={t("weeklySleepTrend")}
          description={t("recoveryDescription")}
          data={weeklySleepChart.map((point) => ({ label: point.label, sleep: point.sleep }))}
          series={[{ key: "sleep", label: "Sueño", color: "#8b5cf6" }]}
        />

        <TrendChartCard
          title={t("weeklyPainTrend")}
          description="Promedio semanal de dolor lumbar para ajustar carga y técnica."
          data={weeklyLowBackChart.map((point) => ({ label: point.label, lowBackPain: point.lowBackPain }))}
          series={[{ key: "lowBackPain", label: "Dolor", color: "#ef4444" }]}
        />
      </div>
    </div>
  );
}
