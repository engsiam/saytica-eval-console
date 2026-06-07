"use client";

import { memo } from "react";
import { AlertCircle, ListTodo, CheckCircle2, PlayCircle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";
import type { Task, TaskStatus } from "@/lib/types";

interface AnnotatorViewProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  updatingTaskId: string | null;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onRetry?: () => void;
}

function SkeletonTaskCard() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 dark:border-zinc-800 p-4" aria-hidden="true">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
      <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800 mb-1" />
      <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800 mb-3" />
      <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export const AnnotatorView = memo(function AnnotatorView({
  tasks,
  loading,
  error,
  updatingTaskId,
  onStatusChange,
  onRetry,
}: AnnotatorViewProps) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading tasks">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonTaskCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50 mb-4">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          Failed to load tasks
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <ListTodo className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          No tasks assigned
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Tasks will appear here once assigned.
        </p>
      </div>
    );
  }

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div aria-live="polite">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6" role="group" aria-label="Task status summary">
        {[
          {
            label: "Pending",
            count: pendingCount,
            icon: Clock,
            className:
              "text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800",
          },
          {
            label: "In Progress",
            count: inProgressCount,
            icon: PlayCircle,
            className:
              "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50",
          },
          {
            label: "Completed",
            count: doneCount,
            icon: CheckCircle2,
            className:
              "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4",
                stat.className,
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl font-semibold tracking-tight">
                  {stat.count}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isUpdating={updatingTaskId === task.id}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
});
