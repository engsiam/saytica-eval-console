import { tasks } from "@/lib/data";
import type { Task, TaskId, TaskStatus } from "@/lib/types";

export function getAllTasks(): Task[] {
  return tasks;
}

export function getTaskById(id: TaskId): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function updateTaskStatus(
  id: TaskId,
  status: TaskStatus,
): Task | null {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const updated = {
    ...tasks[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  tasks[index] = updated;
  return updated;
}
