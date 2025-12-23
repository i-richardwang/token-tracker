"use client";

import { useState, useEffect } from "react";
import { StatsCards } from "./stats-cards";
import { TokenTrendChart } from "./token-trend-chart";
import { CostTrendChart } from "./cost-trend-chart";
import { ProviderPieChart } from "./provider-pie-chart";
import { ModelBarChart } from "./model-bar-chart";
import { StatusPieChart } from "./status-pie-chart";
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

      <TokenTrendChart data={data.tokenTrend} />

      <div className="grid gap-4 md:grid-cols-2">
        <CostTrendChart data={data.costTrend} />
        <ProviderPieChart data={data.providerDistribution} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ModelBarChart data={data.modelDistribution} />
        <StatusPieChart data={data.statusDistribution} />
      </div>
    </div>
  );
}
