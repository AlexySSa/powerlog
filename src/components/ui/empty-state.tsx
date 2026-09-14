import { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[var(--surface-strong)] text-[var(--accent)]">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--foreground-muted)]">
        {description}
      </p>
    </Card>
  );
}
