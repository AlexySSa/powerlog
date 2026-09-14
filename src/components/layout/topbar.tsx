"use client";

import Link from "next/link";
import { LogOut, Settings2 } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { user, signOut, isLocal } = useAuth();
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--card)]/95 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-[var(--foreground-muted)]">{t("welcomeBack")}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="truncate text-xl font-semibold text-[var(--foreground)]">
            {user?.full_name ?? user?.email ?? "Athlete"}
          </p>
          <Badge>{isLocal ? "Local · este navegador" : "Cuenta"}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:items-center">
        <Link href="/settings" className="inline-flex">
          <Button type="button" variant="secondary" className="w-full gap-2 sm:w-36">
            <Settings2 className="size-4" />
            {t("preferences")}
          </Button>
        </Link>

        <Button
          type="button"
          variant="ghost"
          onClick={() => signOut()}
          className="w-full gap-2 sm:w-36"
        >
          <LogOut className="size-4" />
          {t("signOut")}
        </Button>
      </div>
    </div>
  );
}
