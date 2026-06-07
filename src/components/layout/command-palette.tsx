"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Trophy, KanbanSquare, LayoutDashboard } from "lucide-react";

const commands = [
  {
    id: "home",
    label: "Go to Home",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    id: "leaderboard",
    label: "Go to Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    id: "task-board",
    label: "Go to Task Board",
    href: "/task-board",
    icon: KanbanSquare,
  },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = query
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>(
          "[data-cmd-input]",
        );
        input?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          setOpen(false);
          setQuery("");
        }}
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
            <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <input
              data-cmd-input
              className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-500"
              placeholder="Search pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd className="hidden rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500 sm:inline-block">
              ESC
            </kbd>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No results found
              </p>
            ) : (
              <div className="space-y-0.5">
                {filtered.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.href)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      {cmd.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
