"use client";

import { NotebookPen } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { WeeklyReview } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ReviewList({ reviews }: { reviews: WeeklyReview[] }) {
  const orderedReviews = [...reviews].sort(
    (a, b) => +new Date(b.review_date) - +new Date(a.review_date),
  );

  if (orderedReviews.length === 0) {
    return (
      <EmptyState
        icon={NotebookPen}
        title="Todavía no hay evaluaciones"
        description="Cada domingo puedes registrar sensaciones, recuperación y foco para la próxima semana."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orderedReviews.map((review) => (
        <Card key={review.id} className="p-5">
          <p className="text-sm text-[var(--foreground-muted)]">
            {formatDate(review.review_date)} · Semana {review.week_number}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Sensaciones
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{review.weekly_feeling}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Sueño y recuperación
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {review.slept_enough}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {review.recovery_quality}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Dolor
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{review.pain_notes}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Próximo ajuste
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{review.improve_next}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{review.next_week_goal}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
