"use client";

import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  PlayCircle,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "./progress-bar";
import { cn } from "@/lib/utils";
import type { ClientSummary } from "@/lib/types";

interface ClientDashboardProps {
  summary: ClientSummary | null;
  loading: boolean;
  error: string | null;
}

function SkeletonStatCard() {
  return (
    <Card className="animate-pulse">
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

export function ClientDashboard({
  summary,
  loading,
  error,
}: ClientDashboardProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <Card className="animate-pulse">
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50 mb-4">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          Failed to load dashboard
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {error}
        </p>
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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="group hover:shadow-md transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                      stat.color,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FolderOpen className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderOpen className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No projects found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.projects.map((project) => (
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
                    <span
                      className={cn(
                        "text-xs font-medium tabular-nums shrink-0 ml-4",
                        project.completionPercentage >= 80
                          ? "text-emerald-600 dark:text-emerald-400"
                          : project.completionPercentage >= 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-zinc-500 dark:text-zinc-400",
                      )}
                    >
                      {project.completionPercentage}%
                    </span>
                  </div>
                  <ProgressBar value={project.completionPercentage} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
