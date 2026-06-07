import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "Invalid date";
  }
}

export function formatLatency(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "N/A";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatAccuracy(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(1)}%`;
}

export function formatCost(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `$${value.toFixed(4)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "done":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "in-progress":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "pending":
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "done":
      return "Done";
    case "in-progress":
      return "In Progress";
    case "pending":
      return "Pending";
    default:
      return status;
  }
}

export function getAccuracyColor(value: number | null): string {
  if (value === null) return "";
  if (value >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (value >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function getLatencyColor(value: number | null): string {
  if (value === null) return "";
  if (value < 500) return "text-emerald-600 dark:text-emerald-400";
  if (value < 2000) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function getCostColor(value: number | null): string {
  if (value === null) return "";
  if (value < 0.01) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0.05) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function compareNullable<T extends number | string>(
  a: T | null | undefined,
  b: T | null | undefined,
  direction: "asc" | "desc" = "asc",
): number {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  const cmp = a < b ? -1 : a > b ? 1 : 0;
  return direction === "asc" ? cmp : -cmp;
}

export function formatPercentage(pct: number): string {
  return `${Math.min(100, Math.max(0, pct))}%`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
