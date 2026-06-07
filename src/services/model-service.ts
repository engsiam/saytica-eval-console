import { getAllModels, getProviders } from "@/repositories/model-repository";
import { compareNullable } from "@/lib/utils";
import type {
  ModelEvaluation,
  LeaderboardInsights,
  SortField,
  SortDirection,
} from "@/lib/types";

export function getModels(options?: {
  search?: string;
  provider?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
}): ModelEvaluation[] {
  let models = getAllModels();

  if (options?.search) {
    const q = options.search.toLowerCase();
    models = models.filter(
      (m) =>
        m.model.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q),
    );
  }

  if (options?.provider) {
    models = models.filter((m) => m.provider === options.provider);
  }

  if (options?.sortField) {
    const field = options.sortField;
    const dir = options.sortDirection ?? "desc";

    models = [...models].sort((a, b) => {
      if (field === "evaluatedAt") {
        return compareNullable(a.evaluatedAt, b.evaluatedAt, dir);
      }
      const aVal = a[field] as number | null | undefined;
      const bVal = b[field] as number | null | undefined;
      return compareNullable(aVal, bVal, dir);
    });
  }

  return models;
}

export function getProvidersList(): string[] {
  return getProviders();
}

export function getInsights(): LeaderboardInsights {
  const models = getAllModels();

  const withAccuracy = models.filter(
    (m) => m.accuracy !== null && m.accuracy !== undefined,
  );
  const bestAccuracy = withAccuracy.length > 0
    ? withAccuracy.reduce((best, m) =>
        (m.accuracy! > best.accuracy! ? m : best),
      )
    : null;

  const withCost = models.filter(
    (m) => m.costPer1k !== null && m.costPer1k !== undefined,
  );
  const lowestCost = withCost.length > 0
    ? withCost.reduce((best, m) =>
        (m.costPer1k! < best.costPer1k! ? m : best),
      )
    : null;

  const withLatency = models.filter(
    (m) => m.latency !== null && m.latency !== undefined,
  );
  const fastestModel = withLatency.length > 0
    ? withLatency.reduce((best, m) =>
        (m.latency! < best.latency! ? m : best),
      )
    : null;

  return {
    bestAccuracy,
    lowestCost,
    fastestModel,
    totalModels: models.length,
  };
}
