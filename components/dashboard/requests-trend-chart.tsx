"use client";

import { useMemo } from "react";
import { AreaTrendChart } from "./area-trend-chart";
import { formatNumber } from "@/lib/chart-utils";
import type { RequestsTrendItem } from "@/lib/types";

interface RequestsTrendChartProps {
  data: RequestsTrendItem[];
  timeRange: string;
}

export function RequestsTrendChart({ data, timeRange }: RequestsTrendChartProps) {
  const chartData = useMemo(
    () => data.map((item) => ({ date: item.date, value: item.requests })),
    [data]
  );

  return (
    <AreaTrendChart
      title="Requests Trend"
      description="API requests over time"
      data={chartData}
      timeRange={timeRange}
      color="var(--chart-3)"
      yAxisFormatter={formatNumber}
    />
  );
}
