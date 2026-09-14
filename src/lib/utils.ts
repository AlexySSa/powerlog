import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat("es-SV", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
  }).format(/^\d{4}-\d{2}-\d{2}$/.test(date) ? parseISO(date) : new Date(date));
}

/** Date inputs represent the athlete's local calendar day, not the UTC day. */
export function localDateInput(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
