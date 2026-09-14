import { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const accentStyles = {
  primary: "from-[var(--accent)]/25 to-transparent text-[var(--accent)]",
  success: "from-[#22c55e]/25 to-transparent text-[#22c55e]",
  warning: "from-[#f59e0b]/25 to-transparent text-[#f59e0b]",
  danger: "from-[#ef4444]/25 to-transparent text-[#ef4444]",
};

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
  accent?: keyof typeof accentStyles;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  accent = "primary",
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-90",
          accentStyles[accent],
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{value}</p>
          {helper ? <p className="mt-2 text-sm text-[var(--foreground-soft)]">{helper}</p> : null}
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
