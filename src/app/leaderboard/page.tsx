"use client";

import { useMemo, useCallback } from "react";
import { Trophy, Download } from "lucide-react";
import { useModels } from "@/hooks/use-models";
import { getInsights } from "@/services/model-service";
import { InsightCards } from "@/components/leaderboard/insight-cards";
import { SearchBar } from "@/components/leaderboard/search-bar";
import { ProviderFilter } from "@/components/leaderboard/provider-filter";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/utils";
import type { ModelEvaluation, SortState } from "@/lib/types";

function exportCSV(models: ModelEvaluation[]) {
  const headers = [
    "Model",
    "Provider",
    "Accuracy",
    "Latency (ms)",
    "Cost per 1k",
    "Evaluated At",
  ];
  const rows = models.map((m) => [
    m.model,
    m.provider,
    m.accuracy?.toString() ?? "N/A",
    m.latency?.toString() ?? "N/A",
    m.costPer1k?.toString() ?? "N/A",
    m.evaluatedAt ?? "N/A",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "model-leaderboard.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeaderboardPage() {
  const {
    models,
    providers,
    loading,
    error,
    search,
    provider,
    sortField,
    sortDirection,
    setSearch,
    setProvider,
    setSortField,
    setSortDirection,
    refetch,
  } = useModels();

  const insights = useMemo(() => (loading ? null : getInsights()), [loading]);

  const sort: SortState = useMemo(
    () => ({ field: sortField, direction: sortDirection }),
    [sortField, sortDirection],
  );

  const handleSortChange = useCallback(
    (newSort: SortState) => {
      setSortField(newSort.field);
      setSortDirection(newSort.direction);
    },
    [setSortField, setSortDirection],
  );

  const handleExport = useCallback(() => exportCSV(models), [models]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Model Leaderboard
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Compare model performance across accuracy, latency, and cost
            metrics.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="hidden sm:flex gap-2"
          aria-label="Export leaderboard data as CSV"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="Leaderboard insights">
        <InsightCards insights={insights} loading={loading} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by model or provider..."
          />
        </div>
        <div className="w-full sm:w-48">
          <ProviderFilter
            providers={providers}
            value={provider}
            onChange={setProvider}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="sm:hidden gap-2"
          aria-label="Export leaderboard data as CSV"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center justify-between" aria-live="polite">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {loading
            ? "Loading..."
            : `${models.length} ${pluralize(models.length, "model")} found`}
        </p>
      </div>

      <LeaderboardTable
        models={models}
        loading={loading}
        error={error}
        insights={insights}
        sort={sort}
        onSortChange={handleSortChange}
        onRetry={refetch}
      />
    </div>
  );
}
