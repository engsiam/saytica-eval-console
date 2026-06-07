import { tasks } from "@/lib/data";
import type { Task, TaskStatus } from "@/lib/types";

export function getAllTasks(): Task[] {
  return tasks;
}

export function getTaskById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Task | null {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.status = status;
  task.updatedAt = new Date().toISOString();
  return task;
}

export function getProjectIds(): string[] {
  const projects = new Set(tasks.map((t) => t.projectId));
  return Array.from(projects);
}
