"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Task,
  ClientSummary,
  TaskStatus,
  TasksApiData,
  SummaryApiData,
} from "@/lib/types";

interface UseTasksReturn {
  tasks: Task[];
  summary: ClientSummary | null;
  loading: boolean;
  error: string | null;
  updatingTaskId: string | null;
  updateTaskStatus: (
    id: string,
    status: TaskStatus,
  ) => Promise<void>;
  refetch: () => void;
}

export function useTasks(view: "annotator" | "client"): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<ClientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchTasks = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (view === "client") params.set("view", "client");

      const res = await fetch(`/api/tasks?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? `Request failed (${res.status})`,
        );
      }

      const json = await res.json();
      const responseData = json.data as
        | (TasksApiData & { view: "annotator" })
        | (SummaryApiData & { view: "client" });

      if (responseData.view === "client") {
        const d = responseData as SummaryApiData & { view: "client" };
        setSummary(d.summary);
        setTasks([]);
      } else {
        const d = responseData as TasksApiData & { view: "annotator" };
        setTasks(d.tasks);
        setSummary(null);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "An error occurred",
      );
    } finally {
      if (controller === abortRef.current) {
        setLoading(false);
      }
    }
  }, [view]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
    return () => abortRef.current?.abort();
  }, [fetchTasks]);

  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      setUpdatingTaskId(id);
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error?.message ?? `Update failed (${res.status})`,
          );
        }

        const json = await res.json();
        const updated = json.data.task as Task;
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? updated : t)),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update task",
        );
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [],
  );

  return {
    tasks,
    summary,
    loading,
    error,
    updatingTaskId,
    updateTaskStatus,
    refetch: fetchTasks,
  };
}
