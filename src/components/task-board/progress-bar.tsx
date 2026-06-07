"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  size?: "sm" | "md";
  label?: string;
}

export const ProgressBar = memo(function ProgressBar({
  value,
  className,
  size = "md",
  label,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const colorClass =
    clamped >= 80
      ? "bg-emerald-500"
      : clamped >= 50
        ? "bg-amber-500"
        : "bg-zinc-400 dark:bg-zinc-500";

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Progress: ${clamped}%`}
      className={cn(
        "w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden",
        size === "sm" ? "h-1.5" : "h-2.5",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700 ease-out",
          colorClass,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
});
