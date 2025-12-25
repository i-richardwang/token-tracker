"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { DateRangePicker } from "./date-range-picker";
import { RefreshCw } from "@/components/animate-ui/icons/refresh-cw";
import { useDateRange } from "@/lib/hooks/use-date-range";
import type { DashboardData, DateRangeValue } from "@/lib/types";

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

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
  const [dateRange, setDateRange] = useDateRange();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRefreshingRef = useRef(false);

  const apiUrl = useMemo(() => buildApiUrl(dateRange), [dateRange]);
  const timeRangeLabel = useMemo(
    () => getTimeRangeLabel(dateRange),
    [dateRange]
  );

  const fetchData = useCallback(
    async (isAutoRefresh = false) => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      if (!isAutoRefresh) {
        setLoading(true);
      }
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
        isRefreshingRef.current = false;
      }
    },
    [apiUrl]
  );

  // Initial fetch and refetch on apiUrl change
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchData(true);
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <button
              onClick={handleRefresh}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Refresh data"
            >
              <RefreshCw size={16} animateOnHover />
            </button>
          </div>
          <DateRangePicker value={dateRange} onValueChange={setDateRange} />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Refresh data"
          >
            <RefreshCw size={16} animateOnHover />
          </button>
        </div>
        <DateRangePicker value={dateRange} onValueChange={setDateRange} />
      </div>

      <StatsCards summary={data?.summary} loading={loading} />

      <TokensTrendChart
        data={data?.tokensTrend}
        timeRange={timeRangeLabel}
        loading={loading}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CostTrendChart
          data={data?.costTrend}
          timeRange={timeRangeLabel}
          loading={loading}
        />
        <RequestsTrendChart
          data={data?.requestsTrend}
          timeRange={timeRangeLabel}
          loading={loading}
        />
      </div>

      <UsageHeatmapChart data={data?.heatmap} loading={loading} />

      <div className="grid gap-4 md:grid-cols-2">
        <TokensByProviderChart data={data?.byProvider} loading={loading} />
        <CostByProviderChart data={data?.byProvider} loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TokensByBrandChart data={data?.byBrand} loading={loading} />
        <CostByBrandChart data={data?.byBrand} loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TokensByModelChart data={data?.tokensByModel} loading={loading} />
        <TpsByModelChart data={data?.tpsByModel} loading={loading} />
      </div>
    </div>
  );
}
