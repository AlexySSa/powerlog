"use client";

import { WeeklyReviewForm } from "@/components/forms/weekly-review-form";
import { ReviewList } from "@/components/sections/review-list";
import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";

export default function WeeklyReviewPage() {
  const { data } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("weeklyReview")}
        title={t("weeklyReview")}
        description={t("reviewDescription")}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <WeeklyReviewForm />
        <ReviewList reviews={data.weeklyReviews} />
      </div>
    </div>
  );
}
