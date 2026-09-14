import { forwardRef, InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-[3px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-soft)] focus:border-[var(--accent)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
