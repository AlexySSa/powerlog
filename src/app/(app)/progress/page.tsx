"use client";

import { TrendChartCard } from "@/components/charts/trend-chart-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";
import { getLiftRmSummary } from "@/lib/metrics";
import { formatNumber } from "@/lib/utils";

const lifts = [
  { key: "squat", label: "Sentadilla", color: "var(--accent)" },
  { key: "bench", label: "Banca", color: "var(--chart-secondary)" },
  { key: "deadlift", label: "Peso muerto", color: "var(--chart-tertiary)" },
] as const;

export default function ProgressPage() {
  const { data, bodyweightChart, liftChart, weeklyVolumeChart, weeklySleepChart, weeklyLowBackChart } = useAppData();
  const { t } = useI18n();
  return (
    <div className="space-y-9">
      <PageHeader eyebrow="Historial de entrenamiento" title={t("progress")} description="Tus marcas y las estimaciones de cada sesión, vistas a lo largo del tiempo." />
      <section>
        <div className="mb-2 flex items-center justify-between"><h2 className="label">Marcas y estimaciones</h2><span className="label">Kilogramos</span></div>
        <table className="log-table table-fixed">
          <caption className="sr-only">Marcas por levantamiento en kilogramos; un guion indica que todavía no hay registros.</caption>
          <thead><tr><th className="w-[28%]" scope="col">Levantamiento</th><th scope="col">e1RM reciente</th><th scope="col">Mejor e1RM</th><th scope="col">Marca real</th></tr></thead>
          <tbody>{lifts.map((lift) => {
            const summary = getLiftRmSummary(data.workouts, data.prs, lift.key);
            return <tr key={lift.key}><th scope="row" className="pr-2 !text-[11px] !font-semibold !tracking-normal !text-[var(--foreground)] !normal-case sm:!text-sm">{lift.label}</th>{[summary.estimatedRm, summary.bestEstimatedRm, summary.measuredRm].map((value, i) => <td key={i} className="font-mono text-sm sm:text-2xl">{value === null ? <span className="text-[var(--foreground-soft)]" aria-label="Sin registros">—</span> : formatNumber(value, 1)}</td>)}</tr>;
          })}</tbody>
        </table>
        <p className="mt-4 text-xs leading-5 text-[var(--foreground-muted)]">El e1RM estima tu fuerza a partir de peso, repeticiones y RPE. No es un máximo comprobado.</p>
        <details className="mt-2 text-xs text-[var(--foreground-muted)]"><summary className="inline-flex min-h-9 items-center underline decoration-[var(--border)] underline-offset-4">Cómo leer estas cifras</summary><p className="max-w-2xl pb-3 leading-6">El e1RM reciente es la mejor estimación de la última sesión. La marca real es tu mayor intento exitoso registrado. Los ejercicios se agrupan por nombre e incluyen variantes; compara siempre la misma variante. Un guion indica que aún no hay datos.</p></details>
      </section>
      <div className="grid gap-8 xl:grid-cols-3">
        {lifts.map((lift) => <TrendChartCard key={lift.key} title={lift.label} description="e1RM por sesión · kg" data={liftChart.filter((point) => point[lift.key] !== undefined)} series={[{ key: lift.key, label: `${lift.label} (kg)`, color: lift.color }]} />)}
      </div>
      <div className="grid gap-x-9 gap-y-10 border-t border-[var(--border)] pt-8 xl:grid-cols-2">
        <TrendChartCard title={t("weeklyVolume")} description="Carga total registrada en cada semana · kg" data={weeklyVolumeChart.map((point) => ({ label: point.label, volume: point.volume }))} series={[{ key: "volume", label: "Volumen", color: "var(--chart-secondary)" }]} type="bar" />
        <TrendChartCard title={t("bodyweightTrend")} description="Peso corporal de tus registros de recuperación · kg" data={bodyweightChart.map((point) => ({ label: point.label, bodyweight: point.value }))} series={[{ key: "bodyweight", label: "Peso corporal", color: "var(--chart-tertiary)" }]} type="line" />
        <TrendChartCard title={t("weeklySleepTrend")} description="Promedio de horas registradas por semana" data={weeklySleepChart.map((point) => ({ label: point.label, sleep: point.sleep }))} series={[{ key: "sleep", label: "Sueño", color: "var(--chart-secondary)" }]} />
        <TrendChartCard title={t("weeklyPainTrend")} description="Promedio de molestias lumbares · escala 0–10" data={weeklyLowBackChart.map((point) => ({ label: point.label, lowBackPain: point.lowBackPain }))} series={[{ key: "lowBackPain", label: "Dolor", color: "var(--accent)" }]} />
      </div>
    </div>
  );
}
