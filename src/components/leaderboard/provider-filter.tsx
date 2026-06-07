"use client";

import { memo } from "react";
import { Select } from "@/components/ui/select";

interface ProviderFilterProps {
  providers: string[];
  value: string;
  onChange: (value: string) => void;
}

export const ProviderFilter = memo(function ProviderFilter({
  providers,
  value,
  onChange,
}: ProviderFilterProps) {
  const options = providers.map((p) => ({ value: p, label: p }));

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={[{ value: "", label: "All Providers" }, ...options]}
      placeholder="All Providers"
      aria-label="Filter by provider"
    />
  );
});
