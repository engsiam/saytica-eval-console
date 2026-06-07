"use client";

import { memo } from "react";
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  isUpdating: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const statusActions: {
  status: TaskStatus;
  label: string;
  icon: typeof Clock;
  color: string;
}[] = [
  {
    status: "pending",
    label: "Pending",
    icon: Clock,
    color:
      "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
  },
  {
    status: "in-progress",
    label: "In Progress",
    icon: PlayCircle,
    color:
      "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50",
  },
  {
    status: "done",
    label: "Done",
    icon: CheckCircle2,
    color:
      "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
  },
];

export const TaskCard = memo(function TaskCard({
  task,
  isUpdating,
  onStatusChange,
}: TaskCardProps) {
  const StatusIcon =
    task.status === "done"
      ? CheckCircle2
      : task.status === "in-progress"
        ? PlayCircle
        : Clock;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700",
        task.status === "done"
          ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10"
          : task.status === "in-progress"
            ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10"
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon
              className={cn(
                "h-4 w-4",
                task.status === "done"
                  ? "text-emerald-500"
                  : task.status === "in-progress"
                    ? "text-amber-500"
                    : "text-zinc-400",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                getStatusColor(task.status),
              )}
            >
              {getStatusLabel(task.status)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
            {task.title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
            {task.description}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            <span>Project: {task.projectName}</span>
            <span>Assigned: {task.assignedTo}</span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800"
        role="group"
        aria-label={`Change status for task: ${task.title}`}
      >
        {statusActions.map((action) => {
          const ActionIcon = action.icon;
          const isActive = task.status === action.status;
          return (
            <button
              key={action.status}
              onClick={() => onStatusChange(task.id, action.status)}
              disabled={isActive || isUpdating}
              aria-pressed={isActive}
              aria-label={`${task.status === action.status ? "Current: " : "Set to "}${action.label}`}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all min-h-[36px]",
                action.color,
                isActive && "opacity-50 cursor-not-allowed ring-1 ring-inset ring-current",
                !isActive && !isUpdating && "hover:scale-[1.02] active:scale-[0.98]",
                isUpdating && "animate-pulse",
              )}
            >
              {isUpdating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <ActionIcon className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="hidden xs:inline">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
