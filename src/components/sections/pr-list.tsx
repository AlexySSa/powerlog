"use client";

import { Swords } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { PRRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function PRList({ prs }: { prs: PRRecord[] }) {
  const orderedPrs = [...prs].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  if (orderedPrs.length === 0) {
    return (
      <EmptyState
        icon={Swords}
        title="Todavía no hay marcas en el registro"
        description="Guarda PRs e intentos fallidos para construir tu historial de guerra."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orderedPrs.map((pr) => (
        <Card key={pr.id} className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">{formatDate(pr.date)}</p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{pr.exercise}</h3>
              <p className="mt-2 text-sm text-[var(--foreground-soft)]">{pr.comments || "Sin comentarios."}</p>
              {pr.video_url ? (
                <a
                  className="mt-3 inline-flex text-sm text-[var(--accent)]"
                  href={pr.video_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver video
                </a>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 md:min-w-[300px]">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">Peso</p>
                <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{pr.weight} kg</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">BW</p>
                <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{pr.bodyweight} kg</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">PR</p>
                <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{pr.is_pr ? "Sí" : "No"}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">Resultado</p>
                <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                  {pr.successful ? "Hecho" : "Fallido"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
