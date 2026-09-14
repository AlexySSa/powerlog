"use client";

import { PRForm } from "@/components/forms/pr-form";
import { PRList } from "@/components/sections/pr-list";
import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";

export default function WarRoomPage() {
  const { data } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("warRoom")}
        title={t("warRoom")}
        description={t("warLogDescription")}
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <PRForm />
        <PRList prs={data.prs} />
      </div>
    </div>
  );
}
