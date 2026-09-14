import { forwardRef, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-[3px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-soft)] focus:border-[var(--accent)]",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
