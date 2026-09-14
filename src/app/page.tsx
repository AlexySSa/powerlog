"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function Home() {
  const { user } = useAuth();
  const target = user ? "/dashboard" : "/auth";
  return (
    <main className="mx-auto max-w-[1240px] px-6 sm:px-10">
      <header className="flex h-24 items-center justify-between border-b border-[var(--border)]">
        <Link href="/" className="wordmark text-3xl">powerlog<span>.</span></Link>
        <Link href={target} className="text-link">{user ? "Abrir bitácora" : "Entrar"}<ArrowUpRight size={16} /></Link>
      </header>
      <section className="grid items-center gap-14 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-28">
        <div>
          <p className="label mb-7">Sentadilla / Banca / Peso muerto</p>
          <h1 className="font-heading text-[clamp(48px,6.5vw,88px)] leading-[.98]">Lo que toca.<br /><span className="text-[var(--foreground-muted)]">Lo que hiciste.</span></h1>
          <p className="mt-8 max-w-sm text-base leading-7 text-[var(--foreground-muted)]">Tu programa y tu rendimiento, en la misma bitácora. Planifica el bloque, registra las sesiones y revisa cómo cambian tus marcas.</p>
          <Link href={target} className="action-link mt-8">{user ? "Continuar mi entrenamiento" : "Empezar mi bitácora"}<ArrowRight size={16} /></Link>
          <p className="mt-4 text-xs text-[var(--foreground-soft)]">Sin cuenta obligatoria. Datos guardados en tu navegador.</p>
        </div>
        <div className="session-paper rounded-[3px] px-6 py-7 sm:p-9">
          <div className="flex justify-between border-b border-[var(--paper-line)] pb-5"><span className="label">PowerLog / Referencias</span><span className="label">Ejemplo</span></div>
          <p className="mt-8 text-[11px] uppercase tracking-wider text-[var(--paper-muted)]">Punto de partida</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Tres levantamientos.<br />Un bloque de trabajo.</h2>
          <table className="log-table mt-6">
            <thead><tr><th scope="col">Levantamiento</th><th scope="col">1RM inicial</th></tr></thead>
            <tbody>{[["Sentadilla", "405"], ["Press de banca", "275"], ["Peso muerto sumo", "365"]].map(([name, value]) => <tr key={name}><td className="text-sm">{name}</td><td className="font-mono text-xl">{value} <span className="text-[10px] text-[var(--paper-muted)]">LB</span></td></tr>)}</tbody>
          </table>
          <div className="mt-8 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-wider text-[var(--paper-muted)]">Acumulación → Evaluación</span><span className="text-3xl font-bold tracking-tight">08 <span className="font-mono text-[10px] font-normal">SEM.</span></span></div>
          <p className="mt-5 text-[11px] text-[var(--paper-muted)]">Marcas de ejemplo disponibles al configurar tu perfil.</p>
        </div>
      </section>
      <section className="grid border-y border-[var(--border)] md:grid-cols-3">
        {[["01", "Planifica", "Un bloque de ocho semanas, de la acumulación a la evaluación técnica."], ["02", "Registra", "El plan al lado de tus resultados: carga, repeticiones, RPE y notas."], ["03", "Revisa", "Estimaciones de fuerza, volumen y recuperación a partir de tus registros."]].map(([n, title, text]) => <div key={n} className="border-b border-[var(--border)] py-8 last:border-0 md:border-b-0 md:border-r md:px-7 md:first:pl-0"><p className="font-mono text-xs text-[var(--accent)]">{n}</p><h2 className="mt-5 text-xl font-semibold tracking-tight">{title}</h2><p className="mt-3 max-w-xs text-sm leading-6 text-[var(--foreground-muted)]">{text}</p></div>)}
      </section>
      <footer className="flex flex-wrap justify-between gap-4 py-8 text-xs text-[var(--foreground-soft)]"><p>PowerLog · Bitácora de fuerza</p><p>Un complemento para tu registro en Hevy.</p></footer>
    </main>
  );
}
