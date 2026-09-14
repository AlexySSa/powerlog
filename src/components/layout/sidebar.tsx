"use client";

import { BarChart3, ClipboardList, Home, Dumbbell, UserRound, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const mainItems = [
  { href: "/dashboard", key: "dashboard", icon: Home },
  { href: "/cycles", key: "cycles", icon: ClipboardList },
  { href: "/workouts", key: "workouts", icon: Dumbbell },
  { href: "/progress", key: "progress", icon: BarChart3 },
  { href: "/settings", key: "profile", icon: UserRound },
] as const;
const extraItems = [
  { href: "/recovery", key: "recovery" },
  { href: "/war-room", key: "warRoom" },
  { href: "/weekly-review", key: "weeklyReview" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-[208px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar)] px-5 py-8 lg:flex">
        <Link href="/dashboard" className="wordmark px-3" aria-label="PowerLog · Inicio">powerlog<span>.</span></Link>
        <p className="label mt-3 px-3">Bitácora de fuerza</p>
        <nav aria-label="Principal" className="mt-14 space-y-1">
          {mainItems.map(({ href, key }, i) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}
              className={cn("flex min-h-11 items-center gap-4 border-l-2 px-3 text-[13px]", pathname === href ? "border-[var(--accent)] bg-[var(--surface)] text-[var(--foreground)]" : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]")}>
              <span className="font-mono text-[10px] opacity-60">0{i + 1}</span>{t(key)}
            </Link>
          ))}
        </nav>
        <p className="label mb-3 mt-12 px-3">Registro</p>
        <nav aria-label="Registros adicionales">
          {extraItems.map(({ href, key }) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={cn("flex min-h-11 items-center justify-between px-3 text-xs", pathname === href ? "text-[var(--accent)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]")}>
              {t(key)}<ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-[var(--border)] px-3 pt-5">
          <p className="font-mono text-[10px] tracking-wider text-[var(--foreground-soft)]">SQUAT / BENCH / DEADLIFT</p>
          <p className="mt-2 text-xs text-[var(--foreground-muted)]">Planificación y registro.</p>
        </div>
      </aside>
      <nav aria-label="Principal móvil" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--sidebar)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid grid-cols-5">
          {mainItems.map(({ href, key, icon: Icon }) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 border-t-2 text-[10px]", pathname === href ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--foreground-muted)]")}>
              <Icon size={18} strokeWidth={1.5} aria-hidden="true" />{t(key)}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
