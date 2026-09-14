import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <Badge>{eyebrow}</Badge> : null}
        <h1 className="font-heading mt-4 text-3xl uppercase tracking-[0.08em] text-[var(--foreground)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)] md:text-base">
          {description}
        </p>
      </div>
      {action ? <div className="w-full md:min-w-[240px] md:w-auto">{action}</div> : null}
    </div>
  );
}
