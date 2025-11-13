// /app/operations/transparency/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  useTransparencyStore,
  selectLogs,
  selectStats,
  type TransparencyLog,
} from "@/lib/store/transparencyStore";
import { TransparencyHeader } from "@/components/ops/transparency/TransparencyHeader";
import { TransparencySummary } from "@/components/ops/transparency/TransparencySummary";
import { TransparencyCharts } from "@/components/ops/transparency/TransparencyCharts";
import { TransparencyTable } from "@/components/ops/transparency/TransparencyTable";

export interface Filters {
  search?: string;
  severity?: "all" | TransparencyLog["severity"];
  type?: "all" | TransparencyLog["type"];
}

export default function TransparencyDashboard() {
  const logs = useTransparencyStore(selectLogs);
  const stats = useMemo(() => {
    const total = logs.length;
    const bySeverity = logs.reduce(
      (acc, l) => ({
        ...acc,
        [l.severity ?? "info"]: (acc[l.severity ?? "info"] || 0) + 1,
      }),
      { info: 0, warning: 0, error: 0, critical: 0 }
    );
    const byType = logs.reduce(
      (acc, l) => ({ ...acc, [l.type]: (acc[l.type] || 0) + 1 }),
      {} as Record<TransparencyLog["type"], number>
    );
    const recentCritical = logs
      .filter((l) => l.severity === "critical")
      .slice(-5)
      .reverse();

    return { total, bySeverity, byType, recentCritical };
  }, [logs]);

  const [filters, setFilters] = useState<Filters>({
    type: "all",
    severity: "all",
  });

  const filtered = logs.filter((log) => {
    if (
      filters.search &&
      !log.details.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (
      filters.severity &&
      filters.severity !== "all" &&
      log.severity !== filters.severity
    )
      return false;
    if (filters.type && filters.type !== "all" && log.type !== filters.type)
      return false;
    return true;
  });

  return (
    <div className="flex-1 p-4 max-w-7xl ">
      <TransparencyHeader onFilterChange={setFilters} />
      <TransparencySummary stats={stats} />
      <TransparencyCharts logs={filtered} />
      <TransparencyTable logs={filtered} />
    </div>
  );
}
