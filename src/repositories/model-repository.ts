import { modelEvaluations } from "@/lib/data";
import type { ModelEvaluation } from "@/lib/types";

export function getAllModels(): ModelEvaluation[] {
  return modelEvaluations;
}

export function getModelById(id: string): ModelEvaluation | undefined {
  return modelEvaluations.find((m) => m.id === id);
}

export function getProviders(): string[] {
  const providers = new Set(modelEvaluations.map((m) => m.provider));
  return Array.from(providers).sort();
}
