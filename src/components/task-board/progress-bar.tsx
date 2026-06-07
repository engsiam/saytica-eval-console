"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  className,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden",
        size === "sm" ? "h-1.5" : "h-2.5",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          clamped >= 80
            ? "bg-emerald-500"
            : clamped >= 50
              ? "bg-amber-500"
              : "bg-zinc-400 dark:bg-zinc-500",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
