"use client";

import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

interface RoleSwitcherProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export function RoleSwitcher({ role, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-100 dark:bg-zinc-900">
      <button
        onClick={() => onRoleChange("annotator")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
          role === "annotator"
            ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300",
        )}
      >
        <User className="h-4 w-4" />
        Annotator
      </button>
      <button
        onClick={() => onRoleChange("client")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
          role === "client"
            ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300",
        )}
      >
        <Building2 className="h-4 w-4" />
        Client
      </button>
    </div>
  );
}
