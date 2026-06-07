"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  ModelEvaluation,
  SortField,
  SortDirection,
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (provider) params.set("provider", provider);
      if (sortField) params.set("sortField", sortField);
      params.set("sortDirection", sortDirection);

      const res = await fetch(`/api/models?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      setModels(data.models);
      setProviders(data.providers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, provider, sortField, sortDirection]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
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
