import { forwardRef, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-12 w-full rounded-[3px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]",
          className,
          props.disabled && "cursor-not-allowed opacity-60",
        )}
        {...props}
      />
    );
  },
);

Select.displayName = "Select";
