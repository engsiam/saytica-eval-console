"use client";

import { memo } from "react";
import {
  Award,
  Zap,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatAccuracy, formatCost, formatLatency } from "@/lib/utils";
import type { LeaderboardInsights } from "@/lib/types";

interface InsightCardsProps {
  insights: LeaderboardInsights | null;
  loading: boolean;
}

function SkeletonCard() {
  return (
    <Card aria-hidden="true" className="animate-pulse">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const InsightCards = memo(function InsightCards({
  insights,
  loading,
}: InsightCardsProps) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading insights" className="contents">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!insights) return null;

  const cards = [
    {
      label: "Best Accuracy",
      value: insights.bestAccuracy
        ? formatAccuracy(insights.bestAccuracy.accuracy)
        : "N/A",
      subtext: insights.bestAccuracy
        ? `${insights.bestAccuracy.model} (${insights.bestAccuracy.provider})`
        : "No data available",
      icon: Award,
      color:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
      trend: insights.bestAccuracy ? TrendingUp : undefined,
    },
    {
      label: "Lowest Cost",
      value: insights.lowestCost
        ? formatCost(insights.lowestCost.costPer1k)
        : "N/A",
      subtext: insights.lowestCost
        ? `${insights.lowestCost.model} (${insights.lowestCost.provider})`
        : "No data available",
      icon: DollarSign,
      color:
        "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
      trend: insights.lowestCost ? TrendingDown : undefined,
    },
    {
      label: "Fastest Model",
      value: insights.fastestModel
        ? formatLatency(insights.fastestModel.latency)
        : "N/A",
      subtext: insights.fastestModel
        ? `${insights.fastestModel.model} (${insights.fastestModel.provider})`
        : "No data available",
      icon: Zap,
      color:
        "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50",
      trend: insights.fastestModel ? TrendingDown : undefined,
    },
    {
      label: "Total Models",
      value: String(insights.totalModels),
      subtext: "Evaluated in leaderboard",
      icon: BarChart3,
      color:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50",
    },
  ];

  return (
    <>
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend;
        return (
          <Card key={card.label} className="group hover:shadow-md transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.color} transition-transform group-hover:scale-105`}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {card.value}
                    </p>
                    {TrendIcon && (
                      <TrendIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {card.subtext}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
});
