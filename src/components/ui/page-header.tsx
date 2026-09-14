import { ReactNode } from "react";

interface PageHeaderProps { eyebrow?: string; title: string; description: string; action?: ReactNode; }
export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 pb-2 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && eyebrow !== title ? <p className="label mb-3">{eyebrow}</p> : null}
        <h1 className="font-heading text-3xl leading-tight sm:text-[40px]">{title}</h1>
        {description ? <p className="mt-3 max-w-xl text-[13px] leading-6 text-[var(--foreground-muted)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
