"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";

export function Topbar() {
  const { user, signOut, isLocal } = useAuth();
  const { t } = useI18n();
  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--border)]">
      <Link href="/dashboard" className="wordmark lg:hidden">powerlog<span>.</span></Link>
      <p className="label hidden sm:block">Bitácora de fuerza <span className="mx-3 opacity-40">/</span> {isLocal ? "Archivo local" : "Cuenta personal"}</p>
      <div className="ml-auto flex min-w-0 items-center gap-3">
        <Link href="/settings" className="max-w-40 truncate text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)]">{user?.full_name || user?.email || t("profile")}</Link>
        <span className="hidden border-l border-[var(--border)] pl-3 font-mono text-[10px] text-[var(--foreground-soft)] sm:block">{isLocal ? "LOCAL" : "CUENTA"}</span>
        <button onClick={() => void signOut()} className="flex size-11 items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--accent)]" aria-label={t("signOut")} title={t("signOut")}><LogOut size={16} strokeWidth={1.5} /></button>
      </div>
    </header>
  );
}
