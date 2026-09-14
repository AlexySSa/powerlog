"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SettingsForm } from "@/components/forms/settings-form";
import { useAppData } from "@/components/providers/app-data-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  const { data } = useAppData();
  const { isLocal } = useAuth();
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Tu bitácora" title={t("profile")} description="Datos personales y preferencias de la aplicación." />
      <div className="grid gap-10 xl:grid-cols-[1.2fr_1fr]">
        <section><h2 className="label mb-5">Preferencias</h2><SettingsForm /></section>
        <aside>
          <h2 className="label border-b border-[var(--border)] pb-4">Archivo personal</h2>
          <p className="mt-5 text-xl font-medium tracking-tight">{data.profile?.full_name ?? "—"}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--foreground-muted)]">{isLocal ? "Tus registros están guardados en este navegador. No se sincronizan con una cuenta." : "Tus registros y preferencias están asociados a tu cuenta."}</p>
          {isLocal ? <p className="mt-3 text-xs leading-5 text-[var(--foreground-soft)]">Borrar los datos del navegador elimina esta bitácora.</p> : null}
          <h2 className="label mb-1 mt-10 border-b border-[var(--border)] pb-4">Otros registros</h2>
          {[{ href: "/recovery", title: t("recovery"), detail: "Sueño, energía y molestias" }, { href: "/war-room", title: t("warRoom"), detail: "Intentos, fechas y videos" }, { href: "/weekly-review", title: t("weeklyReview"), detail: "Notas para la próxima semana" }].map((item) => <Link href={item.href} key={item.href} className="flex min-h-20 items-center justify-between gap-4 border-b border-[var(--border)] py-4 hover:text-[var(--accent)]"><span><span className="block text-sm">{item.title}</span><span className="mt-2 block text-xs text-[var(--foreground-muted)]">{item.detail}</span></span><ArrowUpRight size={16} /></Link>)}
        </aside>
      </div>
    </div>
  );
}
