"use client";

import { useState, useEffect } from "react";
import { StatsCards } from "./stats-cards";
import { TokensTrendChart } from "./tokens-trend-chart";
import { CostTrendChart } from "./cost-trend-chart";
import { RequestsTrendChart } from "./requests-trend-chart";
import { TokensByProviderChart } from "./tokens-by-provider-chart";
import { CostByProviderChart } from "./cost-by-provider-chart";
import { RequestsByModelChart } from "./requests-by-model-chart";
import { TpsByModelChart } from "./tps-by-model-chart";
import { TimeRangePicker } from "./time-range-picker";
import type { DashboardData } from "@/lib/types";
import { Loader2 } from "lucide-react";

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/dashboard?range=${timeRange}`);
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
  }, [timeRange]);

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
        <TimeRangePicker value={timeRange} onValueChange={setTimeRange} />
      </div>

      <StatsCards summary={data.summary} />

      <TokensTrendChart data={data.tokensTrend} />

      <div className="grid gap-4 md:grid-cols-2">
        <TokensByProviderChart data={data.byProvider} />
        <CostByProviderChart data={data.byProvider} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CostTrendChart data={data.costTrend} />
        <RequestsTrendChart data={data.requestsTrend} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RequestsByModelChart data={data.requestsByModel} />
        <TpsByModelChart data={data.tpsByModel} />
      </div>
    </div>
  );
}
