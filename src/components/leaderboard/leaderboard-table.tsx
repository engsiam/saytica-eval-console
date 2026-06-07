"use client";

/* eslint-disable react-hooks/incompatible-library */
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Medal,
  AlertCircle,
} from "lucide-react";
import { cn, formatAccuracy, formatCost, formatDate, formatLatency, getAccuracyColor, getLatencyColor, getCostColor } from "@/lib/utils";
import type { ModelEvaluation, SortField, SortDirection, LeaderboardInsights } from "@/lib/types";

interface LeaderboardTableProps {
  models: ModelEvaluation[];
  loading: boolean;
  error: string | null;
  insights: LeaderboardInsights | null;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField | null) => void;
  onDirectionChange: (dir: SortDirection) => void;
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

function ErrorState({ message }: { message: string }) {
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
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {message}
          </p>
        </div>
      </td>
    </tr>
  );
}

export function LeaderboardTable({
  models,
  loading,
  error,
  insights,
  sortField,
  sortDirection,
  onSort,
  onDirectionChange,
}: LeaderboardTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      onDirectionChange(sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(field);
      onDirectionChange("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
      );
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-zinc-900 dark:text-zinc-50" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-zinc-900 dark:text-zinc-50" />
    );
  };

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
              <div className="flex items-center justify-center w-8">
                <MedalIcon
                  className={cn("h-4 w-4", medal.className)}
                />
              </div>
            );
          }
          return (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 w-8 text-center block">
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
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                  {model.model}
                </span>
                {badges.slice(0, 1).map((badge, i) => (
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
              {badges.length > 1 && (
                <div className="flex gap-1.5 mt-1">
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
        header: () => (
          <button
            onClick={() => handleSort("accuracy")}
            className="flex items-center font-medium"
          >
            Accuracy
            {getSortIcon("accuracy")}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                getAccuracyColor(val),
              )}
            >
              {formatAccuracy(val)}
            </span>
          );
        },
      }),
      columnHelper.accessor("latency", {
        header: () => (
          <button
            onClick={() => handleSort("latency")}
            className="flex items-center font-medium"
          >
            Latency
            {getSortIcon("latency")}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                getLatencyColor(val),
              )}
            >
              {formatLatency(val)}
            </span>
          );
        },
      }),
      columnHelper.accessor("costPer1k", {
        header: () => (
          <button
            onClick={() => handleSort("costPer1k")}
            className="flex items-center font-medium"
          >
            Cost/1k
            {getSortIcon("costPer1k")}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                getCostColor(val),
              )}
            >
              {formatCost(val)}
            </span>
          );
        },
      }),
      columnHelper.accessor("evaluatedAt", {
        header: () => (
          <button
            onClick={() => handleSort("evaluatedAt")}
            className="flex items-center font-medium"
          >
            Evaluated
            {getSortIcon("evaluatedAt")}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-zinc-600 dark:text-zinc-400 tabular-nums">
            {formatDate(getValue())}
          </span>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortField, sortDirection, insights, models],
  );

  const table = useReactTable({
    data: models,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    });

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider",
                      header.id === "rank" && "w-12",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {loading ? (
              <SkeletonRows />
            ) : error ? (
              <ErrorState message={error} />
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
}
