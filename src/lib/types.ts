export type TaskStatus = "pending" | "in-progress" | "done";

export type Role = "annotator" | "client";

export interface ModelEvaluation {
  id: string;
  model: string;
  provider: string;
  accuracy: number | null;
  latency: number | null;
  costPer1k: number | null;
  evaluatedAt: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
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
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface InsightCard {
  label: string;
  value: string;
  subtext: string;
  icon: string;
}

export interface LeaderboardInsights {
  bestAccuracy: ModelEvaluation | null;
  lowestCost: ModelEvaluation | null;
  fastestModel: ModelEvaluation | null;
  totalModels: number;
}

export type SortField = "accuracy" | "latency" | "costPer1k" | "evaluatedAt";

export type SortDirection = "asc" | "desc";
