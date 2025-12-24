"use client";

import { useState, useEffect, useMemo } from "react";
import { StatsCards } from "./stats-cards";
import { TokensTrendChart } from "./tokens-trend-chart";
import { CostTrendChart } from "./cost-trend-chart";
import { RequestsTrendChart } from "./requests-trend-chart";
import { TokensByProviderChart } from "./tokens-by-provider-chart";
import { CostByProviderChart } from "./cost-by-provider-chart";
import { TokensByBrandChart } from "./tokens-by-brand-chart";
import { CostByBrandChart } from "./cost-by-brand-chart";
import { TokensByModelChart } from "./tokens-by-model-chart";
import { TpsByModelChart } from "./tps-by-model-chart";
import { UsageHeatmapChart } from "./usage-heatmap-chart";
import { DateRangePicker, type DateRangeValue } from "./date-range-picker";
import type { DashboardData } from "@/lib/types";
import { Loader2 } from "lucide-react";

function buildApiUrl(dateRange: DateRangeValue): string {
  if (dateRange.type === "preset") {
    return `/api/dashboard?range=${dateRange.value}`;
  }
  const from = dateRange.from.toISOString();
  const to = dateRange.to.toISOString();
  return `/api/dashboard?from=${from}&to=${to}`;
}

function getTimeRangeLabel(dateRange: DateRangeValue): string {
  if (dateRange.type === "preset") {
    return dateRange.value;
  }
  return "custom";
}

export function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    type: "preset",
    value: "7d",
  });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = useMemo(() => buildApiUrl(dateRange), [dateRange]);
  const timeRangeLabel = useMemo(() => getTimeRangeLabel(dateRange), [dateRange]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <DateRangePicker value={dateRange} onValueChange={setDateRange} />
      </div>

      <StatsCards summary={data.summary} />

      <TokensTrendChart data={data.tokensTrend} timeRange={timeRangeLabel} />

      <div className="grid gap-4 md:grid-cols-2">
        <CostTrendChart data={data.costTrend} timeRange={timeRangeLabel} />
        <RequestsTrendChart data={data.requestsTrend} timeRange={timeRangeLabel} />
      </div>

      <UsageHeatmapChart data={data.usageHeatmap} />

      <div className="grid gap-4 md:grid-cols-2">
        <TokensByProviderChart data={data.byProvider} />
        <CostByProviderChart data={data.byProvider} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TokensByBrandChart data={data.byBrand} />
        <CostByBrandChart data={data.byBrand} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TokensByModelChart data={data.tokensByModel} />
        <TpsByModelChart data={data.tpsByModel} />
      </div>
    </div>
  );
}
