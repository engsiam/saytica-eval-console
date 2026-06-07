"use client";

import { memo } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  PlayCircle,
  TrendingUp,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "./progress-bar";
import { cn } from "@/lib/utils";
import type { ClientSummary } from "@/lib/types";

interface ClientDashboardProps {
  summary: ClientSummary | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

function SkeletonStatCard() {
  return (
    <Card className="animate-pulse" aria-hidden="true">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-7 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof BarChart3;
  color: string;
}) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
              color,
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectProgress({
  project,
}: {
  project: ClientSummary["projects"][number];
}) {
  const pctColor =
    project.completionPercentage >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : project.completionPercentage >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-zinc-500 dark:text-zinc-400";

  return (
    <div key={project.projectId}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
            {project.projectName}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
            {project.completedTasks}/{project.totalTasks} tasks
          </span>
        </div>
        <span className={cn("text-xs font-medium tabular-nums shrink-0 ml-4", pctColor)}>
          {project.completionPercentage}%
        </span>
      </div>
      <ProgressBar
        value={project.completionPercentage}
        label={`${project.projectName}: ${project.completionPercentage}% complete`}
      />
    </div>
  );
}

export const ClientDashboard = memo(function ClientDashboard({
  summary,
  loading,
  error,
  onRetry,
}: ClientDashboardProps) {
  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-live="polite" aria-label="Loading dashboard">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <Card className="animate-pulse" aria-hidden="true">
          <CardContent className="p-6">
            <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
          </CardContent>
        </Card>
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
          Failed to load dashboard
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

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <BarChart3 className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          No data available
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Project data will appear here once tasks are created.
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Tasks",
      value: summary.totalTasks,
      icon: BarChart3,
      color:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50",
    },
    {
      label: "Completed",
      value: summary.completedTasks,
      icon: CheckCircle2,
      color:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      label: "In Progress",
      value: summary.inProgressTasks,
      icon: PlayCircle,
      color:
        "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
    },
    {
      label: "Pending",
      value: summary.pendingTasks,
      icon: Clock,
      color:
        "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50",
    },
    {
      label: "Completion",
      value: `${summary.completionPercentage}%`,
      icon: TrendingUp,
      color:
        "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50",
    },
  ];

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" role="group" aria-label="Client metrics">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FolderOpen className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-2" aria-hidden="true" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No projects found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.projects.map((project) => (
                <ProjectProgress key={project.projectId} project={project} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
