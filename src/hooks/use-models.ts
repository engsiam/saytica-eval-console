"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  ModelEvaluation,
  SortField,
  SortDirection,
  ModelsApiData,
} from "@/lib/types";

interface UseModelsReturn {
  models: ModelEvaluation[];
  providers: string[];
  loading: boolean;
  error: string | null;
  search: string;
  provider: string;
  sortField: SortField | null;
  sortDirection: SortDirection;
  setSearch: (value: string) => void;
  setProvider: (value: string) => void;
  setSortField: (field: SortField | null) => void;
  setSortDirection: (dir: SortDirection) => void;
  refetch: () => void;
}

export function useModels(): UseModelsReturn {
  const [models, setModels] = useState<ModelEvaluation[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchModels = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (provider) params.set("provider", provider);
      if (sortField) params.set("sortField", sortField);
      params.set("sortDirection", sortDirection);

      const res = await fetch(`/api/models?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? `Request failed (${res.status})`,
        );
      }

      const json = await res.json();
      const data = json.data as ModelsApiData;
      setModels(data.models);
      setProviders(data.providers);
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
  }, [debouncedSearch, provider, sortField, sortDirection]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    return () => abortRef.current?.abort();
  }, [fetchModels]);

  return {
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
    refetch: fetchModels,
  };
}
