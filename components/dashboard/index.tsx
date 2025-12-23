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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LLM Token Usage Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Monitor your LLM API usage and costs
          </p>
        </div>
        <TimeRangePicker value={timeRange} onValueChange={setTimeRange} />
      </div>

      {/* Stats Cards */}
      <StatsCards summary={data.summary} />

      {/* Token Trend Chart - Full Width */}
      <TokenTrendChart data={data.tokenTrend} />

      {/* Cost Trend + Provider Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <CostTrendChart data={data.costTrend} />
        <ProviderPieChart data={data.providerDistribution} />
      </div>

      {/* Model Bar Chart + Status Pie Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <ModelBarChart data={data.modelDistribution} />
        <StatusPieChart data={data.statusDistribution} />
      </div>
    </div>
  );
}
