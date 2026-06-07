"use client";

/* eslint-disable react-hooks/incompatible-library */
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { useMemo, memo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Medal,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn, formatAccuracy, formatCost, formatDate, formatLatency, getAccuracyColor, getLatencyColor, getCostColor } from "@/lib/utils";
import type { ModelEvaluation, LeaderboardInsights, SortState } from "@/lib/types";

interface LeaderboardTableProps {
  models: ModelEvaluation[];
  loading: boolean;
  error: string | null;
  insights: LeaderboardInsights | null;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  onRetry?: () => void;
}

function rankToMedal(rank: number) {
  if (rank === 0) return { icon: Medal, className: "text-yellow-500" };
  if (rank === 1)
    return { icon: Medal, className: "text-zinc-400 dark:text-zinc-300" };
  if (rank === 2)
    return { icon: Medal, className: "text-amber-700 dark:text-amber-500" };
  return null;
}

function getBestBadge(
  model: ModelEvaluation,
  insights: LeaderboardInsights | null,
  type: "accuracy" | "cost" | "latency",
): { label: string; className: string } | null {
  if (!insights) return null;
  if (
    type === "accuracy" &&
    insights.bestAccuracy?.id === model.id &&
    model.accuracy !== null
  ) {
    return {
      label: "Best Accuracy",
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    };
  }
  if (
    type === "cost" &&
    insights.lowestCost?.id === model.id &&
    model.costPer1k !== null
  ) {
    return {
      label: "Lowest Cost",
      className:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  if (
    type === "latency" &&
    insights.fastestModel?.id === model.id &&
    model.latency !== null
  ) {
    return {
      label: "Fastest",
      className:
        "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    };
  }
  return null;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
            <AlertCircle className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            No models found
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </td>
    </tr>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <tr>
      <td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Failed to load models
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export const LeaderboardTable = memo(function LeaderboardTable({
  models,
  loading,
  error,
  insights,
  sort,
  onSortChange,
  onRetry,
}: LeaderboardTableProps) {
  const columnHelper = createColumnHelper<ModelEvaluation>();

  const columns = useMemo(
    () => [
      columnHelper.accessor((_, i) => i, {
        id: "rank",
        header: "",
        cell: ({ row }) => {
          const rank = row.index;
          const medal = rankToMedal(rank);
          const MedalIcon = medal?.icon;
          if (MedalIcon && medal) {
            return (
              <div className="flex items-center justify-center w-8" aria-label={`Rank #${rank + 1}`}>
                <MedalIcon className={cn("h-4 w-4", medal.className)} aria-hidden="true" />
              </div>
            );
          }
          return (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 w-8 text-center block" aria-label={`Rank #${rank + 1}`}>
              #{rank + 1}
            </span>
          );
        },
        size: 48,
      }),
      columnHelper.accessor("model", {
        header: "Model",
        cell: ({ row }) => {
          const model = row.original;
          const accBadge = getBestBadge(model, insights, "accuracy");
          const costBadge = getBestBadge(model, insights, "cost");
          const latBadge = getBestBadge(model, insights, "latency");
          const badges = [accBadge, costBadge, latBadge].filter(Boolean);

          return (
            <div className="max-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50 truncate">
                  {model.model}
                </span>
                {badges.slice(0, 1).map((badge, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none shrink-0",
                      badge?.className,
                    )}
                  >
                    {badge?.label}
                  </span>
                ))}
              </div>
              {badges.length > 1 && (
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {badges.slice(1).map((badge, i) => (
                    <span
                      key={i}
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none",
                        badge?.className,
                      )}
                    >
                      {badge?.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("provider", {
        header: "Provider",
        cell: ({ getValue }) => (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("accuracy", {
        header: "Accuracy",
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                getAccuracyColor(val),
              )}
            >
              {val !== null ? formatAccuracy(val) : "N/A"}
            </span>
          );
        },
      }),
      columnHelper.accessor("latency", {
        header: "Latency",
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                getLatencyColor(val),
              )}
            >
              {val !== null ? formatLatency(val) : "N/A"}
            </span>
          );
        },
      }),
      columnHelper.accessor("costPer1k", {
        header: "Cost/1k",
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                getCostColor(val),
              )}
            >
              {val !== null ? formatCost(val) : "N/A"}
            </span>
          );
        },
      }),
      columnHelper.accessor("evaluatedAt", {
        header: "Evaluated",
        cell: ({ getValue }) => (
          <span className="text-sm text-zinc-600 dark:text-zinc-400 tabular-nums">
            {getValue() ? formatDate(getValue()) : "N/A"}
          </span>
        ),
      }),
    ],
    [insights, columnHelper],
  );

  const table = useReactTable({
    data: models,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const sortableColumnIds = ["accuracy", "latency", "costPer1k", "evaluatedAt"] as const;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800" role="region" aria-label="Model leaderboard table">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
              >
                {headerGroup.headers.map((header) => {
                  const colId = header.id;
                  const isSortable = sortableColumnIds.includes(colId as typeof sortableColumnIds[number]);
                  const isSorted = sort.field === colId;
                  const dir = isSorted ? sort.direction : null;

                  const ariaSort = isSorted
                    ? (dir === "asc" ? "ascending" as const : "descending" as const)
                    : (isSortable ? "none" as const : undefined);

                  const Icon = !isSorted
                    ? ArrowUpDown
                    : dir === "asc"
                      ? ArrowUp
                      : ArrowDown;

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider",
                        header.id === "rank" && "w-12",
                      )}
                    >
                      {header.isPlaceholder ? null : isSortable ? (
                        <button
                          onClick={() =>
                            onSortChange(
                              isSorted
                                ? { field: colId as "accuracy" | "latency" | "costPer1k" | "evaluatedAt", direction: dir === "asc" ? "desc" : "asc" }
                                : { field: colId as "accuracy" | "latency" | "costPer1k" | "evaluatedAt", direction: "desc" },
                            )
                          }
                          className="flex items-center gap-1 font-medium hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {loading ? (
              <SkeletonRows />
            ) : error ? (
              <ErrorState message={error} onRetry={onRetry} />
            ) : models.length === 0 ? (
              <EmptyState />
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                    index % 2 === 0 &&
                      "bg-white dark:bg-zinc-950",
                    index % 2 !== 0 &&
                      "bg-zinc-50/50 dark:bg-zinc-900/30",
                    (insights?.bestAccuracy?.id === row.original.id ||
                      insights?.lowestCost?.id === row.original.id ||
                      insights?.fastestModel?.id === row.original.id) &&
                      "ring-1 ring-inset ring-zinc-200/50 dark:ring-zinc-700/50",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3 text-sm",
                        cell.column.id === "rank" && "w-12",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
