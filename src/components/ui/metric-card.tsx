import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
  accent?: "primary" | "success" | "warning" | "danger";
}
export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <Card className="p-5">
      <p className="label">{label}</p>
      <p className="mt-4 text-3xl font-medium tracking-tight tabular-nums">{value}</p>
      {helper ? <p className="mt-2 text-xs text-[var(--foreground-muted)]">{helper}</p> : null}
    </Card>
  );
}
