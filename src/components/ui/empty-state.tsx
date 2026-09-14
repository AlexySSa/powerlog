import { LucideIcon } from "lucide-react";

interface EmptyStateProps { icon: LucideIcon; title: string; description: string; }
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-32 flex-col justify-center border-y border-dashed border-[var(--border)] py-6">
      <p className="text-sm font-medium text-[var(--foreground-muted)]">{title}</p>
      <p className="mt-2 max-w-md text-xs leading-5 text-[var(--foreground-soft)]">{description}</p>
    </div>
  );
}
