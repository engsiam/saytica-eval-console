"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, ClientSummary } from "@/lib/types";

interface UseTasksReturn {
  tasks: Task[];
  summary: ClientSummary | null;
  loading: boolean;
  error: string | null;
  updatingTaskId: string | null;
  updateTaskStatus: (
    id: string,
    status: "pending" | "in-progress" | "done",
  ) => Promise<void>;
  refetch: () => void;
}

export function useTasks(view: "annotator" | "client"): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<ClientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(
    null,
  );

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (view === "client") params.set("view", "client");

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();

      if (data.view === "client") {
        setSummary(data.summary);
      } else {
        setTasks(data.tasks);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  const updateTaskStatus = useCallback(
    async (
      id: string,
      status: "pending" | "in-progress" | "done",
    ) => {
      setUpdatingTaskId(id);
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update task");
        const data = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? data.task : t)),
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
