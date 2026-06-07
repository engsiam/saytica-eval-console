import Link from "next/link";
import { ArrowRight, Trophy, KanbanSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto space-y-12 py-16">
        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-50 mb-2">
            <span className="text-base font-bold text-zinc-50 dark:text-zinc-900">
              SE
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Saytica Eval Console
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            AI evaluation platform for comparing model performance and
            managing annotation tasks.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/leaderboard" className="group">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 mb-2 transition-transform group-hover:scale-105">
                  <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">Model Leaderboard</CardTitle>
                <CardDescription>
                  Compare accuracy, latency, and cost across AI models with
                  sorting, filtering, and ranking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:gap-3 transition-all">
                  View Leaderboard
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/task-board" className="group">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 mb-2 transition-transform group-hover:scale-105">
                  <KanbanSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-lg">Task Board</CardTitle>
                <CardDescription>
                  Manage annotation tasks as an annotator or monitor project
                  progress as a client.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:gap-3 transition-all">
                  View Task Board
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Press{" "}
            <kbd className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Ctrl+K
            </kbd>{" "}
            to open command palette
          </p>
        </div>
      </div>
    </div>
  );
}
