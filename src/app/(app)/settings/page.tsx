"use client";

import { Palette, Settings2, UserRound } from "lucide-react";

import { SettingsForm } from "@/components/forms/settings-form";
import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  const { data } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("preferences")}
        title={t("preferences")}
        description="Mueve idioma y tema aqui, y deja la app lista para que se sienta bien en tu uso diario."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SettingsForm />

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--surface)] p-3 text-[var(--accent)]">
                <Settings2 className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Ajustes guardados en MySQL
                </h3>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  Tu idioma y tema quedan asociados a tu cuenta.
                </p>
              </div>
            </div>
          </Card>

          <Card className="grid gap-4 p-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <UserRound className="size-5 text-[var(--accent)]" />
              <p className="mt-3 text-sm text-[var(--foreground-soft)]">{t("fullName")}</p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {data.profile?.full_name ?? "--"}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <Palette className="size-5 text-[var(--accent)]" />
              <p className="mt-3 text-sm text-[var(--foreground-soft)]">{t("theme")}</p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {data.profile?.preferred_theme === "light" ? t("light") : t("dark")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
