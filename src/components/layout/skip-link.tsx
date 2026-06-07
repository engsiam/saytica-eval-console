"use client";

import { cn } from "@/lib/utils";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className={cn(
        "fixed left-3 top-3 z-[100] rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50",
        "opacity-0 -translate-y-2 pointer-events-none",
        "focus:opacity-100 focus:translate-y-0 focus:pointer-events-auto",
        "transition-all duration-200 outline-none",
      )}
    >
      Skip to main content
    </a>
  );
}
