import {
  getAllTasks,
  getTaskById,
  updateTaskStatus,
} from "@/repositories/task-repository";
import type { ClientSummary, ProjectSummary, Task, TaskId, TaskStatus } from "@/lib/types";

export function getTasks(): Task[] {
  return getAllTasks();
}

export function getTask(id: TaskId): Task | null {
  return getTaskById(id) ?? null;
}

export function updateStatus(id: TaskId, status: TaskStatus): Task | null {
  return updateTaskStatus(id, status);
}

export function getClientSummary(): ClientSummary {
  const all = getAllTasks();
  const pending = all.filter((t) => t.status === "pending");
  const inProgress = all.filter((t) => t.status === "in-progress");
  const done = all.filter((t) => t.status === "done");

  const projectMap = new Map<string, Task[]>();
  for (const task of all) {
    const existing = projectMap.get(task.projectId) ?? [];
    existing.push(task);
    projectMap.set(task.projectId, existing);
  }

  const projects: ProjectSummary[] = Array.from(projectMap.entries()).map(
    ([projectId, projectTasks]) => {
      const completed = projectTasks.filter(
        (t) => t.status === "done",
      ).length;
      return {
        projectId: projectId as Task["projectId"],
        projectName: projectTasks[0]?.projectName ?? "Unknown",
        totalTasks: projectTasks.length,
        completedTasks: completed,
        completionPercentage:
          projectTasks.length > 0
            ? Math.round((completed / projectTasks.length) * 100)
            : 0,
      };
    },
  );

  return {
    totalTasks: all.length,
    pendingTasks: pending.length,
    inProgressTasks: inProgress.length,
    completedTasks: done.length,
    completionPercentage:
      all.length > 0
        ? Math.round((done.length / all.length) * 100)
        : 0,
    projects,
  };
}
