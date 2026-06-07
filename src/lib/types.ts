export type TaskId = string;
export type ModelId = string;
export type ProjectId = string;

export const TASK_STATUSES = ["pending", "in-progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const SORT_FIELDS = ["accuracy", "latency", "costPer1k", "evaluatedAt"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export type SortDirection = "asc" | "desc";

export type Role = "annotator" | "client";

export interface ModelEvaluation {
  id: ModelId;
  model: string;
  provider: string;
  accuracy: number | null;
  latency: number | null;
  costPer1k: number | null;
  evaluatedAt: string | null;
}

export interface Task {
  id: TaskId;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: ProjectId;
  projectName: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSummary {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  completionPercentage: number;
  projects: ProjectSummary[];
}

export interface ProjectSummary {
  projectId: ProjectId;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface LeaderboardInsights {
  bestAccuracy: ModelEvaluation | null;
  lowestCost: ModelEvaluation | null;
  fastestModel: ModelEvaluation | null;
  totalModels: number;
}

export interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;

export interface ModelsApiData {
  models: ModelEvaluation[];
  providers: string[];
}

export interface TasksApiData {
  tasks: Task[];
}

export interface SummaryApiData {
  summary: ClientSummary;
}

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export function isSortField(value: string): value is SortField {
  return SORT_FIELDS.includes(value as SortField);
}
