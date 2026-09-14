"use client";

import {
  Activity,
  BarChart3,
  ClipboardList,
  HeartPulse,
  Home,
  Medal,
  NotebookPen,
  Settings2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", key: "dashboard", icon: Home },
  { href: "/cycles", key: "cycles", icon: ClipboardList },
  { href: "/workouts", key: "workouts", icon: Activity },
  { href: "/recovery", key: "recovery", icon: HeartPulse },
  { href: "/progress", key: "progress", icon: BarChart3 },
  { href: "/war-room", key: "warRoom", icon: Trophy },
  { href: "/weekly-review", key: "weeklyReview", icon: NotebookPen },
  { href: "/settings", key: "preferences", icon: Settings2 },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar)]/95 px-5 py-6 backdrop-blur lg:block">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5">
          <Badge>{t("gymReady")}</Badge>
          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--accent)] p-3 text-[var(--accent-foreground)]">
              <Medal className="size-6" />
            </div>
            <div>
              <p className="font-heading text-3xl uppercase tracking-[0.12em] text-[var(--foreground)]">
                PowerLog
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">8 Weeks</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-2">
          {navItems.map(({ href, key, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-[var(--surface-strong)] text-[var(--foreground)]"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon className="size-5" />
                {t(key)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-4 bottom-4 z-40 overflow-x-auto rounded-[24px] border border-[var(--border)] bg-[var(--sidebar)]/95 p-2 backdrop-blur lg:hidden">
        <div className="grid min-w-max grid-flow-col gap-1">
        {navItems.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[78px] flex-col items-center justify-center rounded-2xl px-2 py-2 text-[10px] font-semibold transition",
                active
                  ? "bg-[var(--surface-strong)] text-[var(--foreground)]"
                  : "text-[var(--foreground-muted)]",
              )}
            >
              <Icon className="mb-1 size-4" />
              <span className="truncate">{t(key)}</span>
            </Link>
          );
        })}
        </div>
      </nav>
    </>
  );
}
