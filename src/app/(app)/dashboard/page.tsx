"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { TrendChartCard } from "@/components/charts/trend-chart-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { getWeekSessionProgress, plannedWorkoutHref } from "@/lib/cycle-utils";
import { formatDate, formatNumber, localDateInput } from "@/lib/utils";

export default function DashboardPage() {
  const { data, dashboard, recentWorkouts, liftChart, recoveryStatus, loading } = useAppData();
  const cycle = dashboard.activeCycle;
  const progress = getWeekSessionProgress(cycle, dashboard.currentWeek, data.workouts);
  const next = progress.next;
  const week = cycle?.program_template.find((entry) => entry.week_number === dashboard.currentWeek);
  const workoutHref = next ? plannedWorkoutHref(next.cycle.id, next.weekNumber, next.sessionIndex) : "/workouts";
  const references = [
    { code: "SQ", name: "Sentadilla", value: dashboard.currentSquatRm },
    { code: "BP", name: "Banca", value: dashboard.currentBenchRm },
    { code: "DL", name: "Peso muerto", value: dashboard.currentDeadliftRm },
  ];

  if (loading) return <p className="label py-20" role="status">Abriendo tu bitácora…</p>;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="label mb-3">{formatDate(localDateInput())} / Inicio</p><h1 className="font-heading text-[38px] leading-none sm:text-5xl">El trabajo de hoy.</h1></div>
        <Link href="/cycles" className="text-link">Ver planificación <ArrowUpRight size={15} /></Link>
      </header>

      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.65fr)_minmax(260px,1fr)]">
        <section className="session-paper overflow-hidden rounded-[3px]">
          <div className="flex items-center justify-between border-b border-[var(--paper-line)] px-5 py-4 sm:px-7">
            <p className="label">Hoja de sesión</p>
            <span className="font-mono text-[10px] text-[var(--paper-muted)]">{cycle ? `BLOQUE / S${String(dashboard.currentWeek).padStart(2, "0")}` : "SIN BLOQUE"}</span>
          </div>
          <div className="px-5 py-6 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="label mb-2">{next ? next.session.day_label : "Planificación"}</p><h2 className="max-w-md text-[26px] font-bold leading-tight tracking-[-0.04em] sm:text-[32px]">{next ? next.session.focus : cycle ? "Semana registrada." : "Tu primer bloque."}</h2></div>
              <span className="font-mono text-4xl leading-none text-[var(--paper-line)]" aria-hidden="true">{next ? String(next.sessionIndex + 1).padStart(2, "0") : "—"}</span>
            </div>
            {next ? (
              <table className="log-table mt-6">
                <thead><tr><th scope="col">Ejercicio</th><th scope="col">Prescripción</th></tr></thead>
                <tbody>{next.session.exercises.map((exercise, index) => (
                  <tr key={index}><td className="pr-4 text-[13px]"><span className="mr-3 hidden font-mono text-[10px] text-[var(--paper-muted)] sm:inline">{String(index + 1).padStart(2, "0")}</span>{exercise.name}</td><td className="max-w-40 font-mono text-xs leading-5">{exercise.prescription}</td></tr>
                ))}</tbody>
              </table>
            ) : <p className="my-8 max-w-sm text-sm leading-6 text-[var(--paper-muted)]">{cycle ? "Ya registraste las sesiones previstas. Consulta el bloque o añade un entrenamiento." : "Configura tus marcas y crea ocho semanas de entrenamiento."}</p>}
            {next?.session.notes ? <p className="mt-4 text-xs leading-5 text-[var(--paper-muted)]">{next.session.notes}</p> : null}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-52 text-xs leading-5 text-[var(--paper-muted)]">La prescripción es el plan.<br />Registra lo que hiciste al terminar.</p>
              <Link href={cycle ? workoutHref : "/cycles"} className="inline-flex min-h-12 items-center justify-center gap-8 rounded-[3px] bg-[#ad3329] px-5 text-[13px] font-semibold text-white hover:bg-[#922a22]">{cycle ? "Abrir entrenamiento" : "Crear ciclo"}<ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        <aside className="space-y-7">
          <section>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4"><h2 className="label">Bloque en curso</h2><Link href="/cycles" className="text-[var(--foreground-muted)]" aria-label="Ver ciclo"><ArrowUpRight size={16} /></Link></div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{cycle?.name ?? "Sin ciclo activo"}</h3>
            {cycle ? <p className="mt-2 text-xs text-[var(--foreground-muted)]">{formatDate(cycle.start_date)} — {formatDate(cycle.end_date)}</p> : null}
            <div className="mb-3 mt-6 flex items-baseline justify-between"><p className="text-sm">Semana <span className="font-mono text-xl">{dashboard.currentWeek.toString().padStart(2, "0")}</span><span className="text-[var(--foreground-soft)]"> / {cycle?.program_template.length ?? "—"}</span></p><span className="font-mono text-xs text-[var(--foreground-muted)]">{progress.percent}%</span></div>
            <progress value={progress.completed} max={progress.total || 1} className="block h-[3px] w-full" aria-label="Sesiones registradas de la semana" />
            <p className="mt-3 text-xs text-[var(--foreground-muted)]">{progress.completed} de {progress.total} sesiones registradas</p>
            <p className="mt-5 border-l-2 border-[var(--accent)] pl-3 text-sm">{week?.phase ?? "Empieza desde Ciclos"}</p>
          </section>
          <section className="border-t border-[var(--border)] pt-5">
            <div className="flex items-center justify-between"><h2 className="label">Recuperación</h2><Link href="/recovery" className="text-link">Registrar <ArrowUpRight size={13} /></Link></div>
            <p className="mt-1 text-xl tracking-tight">{data.recoveryLogs.length ? recoveryStatus.label : "Sin registro reciente"}</p>
            <dl className="mt-5 grid grid-cols-2 gap-5">
              <div><dt className="text-xs text-[var(--foreground-muted)]">Sueño medio</dt><dd className="mt-2 font-mono text-lg">{formatNumber(dashboard.averageSleep, 1)} <span className="text-xs text-[var(--foreground-soft)]">h</span></dd></div>
              <div><dt className="text-xs text-[var(--foreground-muted)]">Peso corporal</dt><dd className="mt-2 font-mono text-lg">{formatNumber(dashboard.currentBodyweight, 1)} <span className="text-xs text-[var(--foreground-soft)]">kg</span></dd></div>
            </dl>
            <Link href="/weekly-review" className="text-link mt-3">Revisar la semana <ArrowRight size={13} /></Link>
          </section>
        </aside>
      </div>

      {week ? <section className="border-y border-[var(--border)] py-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="label">Esta semana</h2><span className="label">S{String(dashboard.currentWeek).padStart(2, "0")}</span></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {week.sessions.map((session, index) => {
            const recorded = data.workouts.some((log) => log.cycle_id === cycle?.id && log.week_number === dashboard.currentWeek && log.day_label === session.day_label);
            const isNext = next?.sessionIndex === index;
            return <Link key={index} href={plannedWorkoutHref(cycle!.id, week.week_number, index)} className={`group min-h-20 border-l-2 py-1 pl-3 ${isNext ? "border-[var(--accent)]" : "border-[var(--border)]"}`}>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-[var(--foreground-muted)]">{session.day_label}{recorded ? <Check size={12} className="text-[var(--accent)]" aria-label="Registrada" /> : null}</div>
              <p className="mt-2 text-xs leading-5 group-hover:text-[var(--accent)]">{session.focus}</p>
              {isNext ? <p className="mt-1 font-mono text-[9px] uppercase text-[var(--accent)]">Próxima sesión</p> : null}
            </Link>;
          })}
        </div>
      </section> : null}

      <section>
        <div className="flex items-center justify-between"><h2 className="label">Referencias de fuerza</h2><Link href="/progress" className="text-link">Ver progreso <ArrowUpRight size={14} /></Link></div>
        <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-y border-[var(--border)]">
          {references.map((lift) => <div key={lift.code} className="py-5 pl-4 first:pl-0 sm:py-6 sm:pl-7">
            <p className="text-xs text-[var(--foreground-muted)]"><span className="mr-2 hidden font-mono text-[10px] text-[var(--accent)] sm:inline">{lift.code}</span>{lift.name}</p>
            <p className="mt-3 text-[25px] font-medium leading-none tracking-tight tabular-nums sm:text-[40px]">{formatNumber(lift.value, 1)} <span className="font-mono text-[10px] text-[var(--foreground-muted)] sm:text-xs">kg</span></p>
          </div>)}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[var(--foreground-soft)]">Marca registrada, estimación más reciente o referencia inicial. Consulta el detalle en Progreso.</p>
      </section>

      <div className="grid gap-7 xl:grid-cols-2">
        <TrendChartCard title="Evolución del e1RM" description="Estimaciones por sesión · kg" data={liftChart} series={[{ key: "squat", label: "Sentadilla", color: "var(--accent)" }, { key: "bench", label: "Banca", color: "var(--chart-secondary)" }, { key: "deadlift", label: "Peso muerto", color: "var(--chart-tertiary)" }]} />
        <section className="min-w-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4"><h2 className="section-title">Últimas sesiones</h2><Link href="/workouts" className="text-link">Ver todas <ArrowUpRight size={13} /></Link></div>
          {recentWorkouts.length ? <ul>{recentWorkouts.slice(0, 4).map((workout) => <li key={workout.id} className="border-b border-[var(--border)] py-4">
            <p className="font-mono text-[10px] text-[var(--foreground-muted)]">{formatDate(workout.date)} / S{workout.week_number}</p>
            <div className="mt-2 flex items-baseline justify-between gap-4"><p className="text-sm">{workout.title}</p><span className="shrink-0 font-mono text-xs">{formatNumber(workout.sets.reduce((total, set) => total + set.volume, 0))} <span className="text-[var(--foreground-soft)]">kg</span></span></div>
          </li>)}</ul> : <p className="py-8 text-sm text-[var(--foreground-muted)]">Aquí aparecerá tu primera sesión registrada.</p>}
          <Link href="/war-room" className="text-link mt-2">{dashboard.lastPR ? `Último PR: ${dashboard.lastPR.weight} kg · ${dashboard.lastPR.exercise}` : "Consultar marcas personales"}<ArrowUpRight size={13} /></Link>
        </section>
      </div>
    </div>
  );
}
