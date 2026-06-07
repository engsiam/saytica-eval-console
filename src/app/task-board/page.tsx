"use client";

import { KanbanSquare } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { RoleSwitcher } from "@/components/task-board/role-switcher";
import { AnnotatorView } from "@/components/task-board/annotator-view";
import { ClientDashboard } from "@/components/task-board/client-dashboard";
import type { Role } from "@/lib/types";

export default function TaskBoardPage() {
  const [role, setRole] = useLocalStorage<Role>("saytica-role", "annotator");
  const {
    tasks,
    summary,
    loading,
    error,
    updatingTaskId,
    updateTaskStatus,
  } = useTasks(role);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <KanbanSquare className="h-5 w-5 text-indigo-500" />
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Task Board
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {role === "annotator"
              ? "View and manage your assigned annotation tasks."
              : "Monitor project progress and task completion."}
          </p>
        </div>
        <RoleSwitcher role={role} onRoleChange={setRole} />
      </div>

      {role === "annotator" ? (
        <AnnotatorView
          tasks={tasks}
          loading={loading}
          error={error}
          updatingTaskId={updatingTaskId}
          onStatusChange={updateTaskStatus}
        />
      ) : (
        <ClientDashboard
          summary={summary}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
