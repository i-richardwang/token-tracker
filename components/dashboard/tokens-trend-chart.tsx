"use client";

import { useMemo } from "react";
import { AreaTrendChart } from "./area-trend-chart";
import type { TokensTrendItem } from "@/lib/types";

interface TokensTrendChartProps {
  data?: TokensTrendItem[];
  timeRange?: string;
  loading?: boolean;
}

export function TokensTrendChart({ data, timeRange, loading }: TokensTrendChartProps) {
  const chartData = useMemo(
    () =>
      data?.map((item) => ({
        date: item.date,
        value: item.prompt + item.completion,
      })),
    [data]
  );

  return (
    <AreaTrendChart
      title="Tokens Trend"
      description="Total token usage over time"
      data={chartData}
      timeRange={timeRange}
      height={300}
      loading={loading}
    />
  );
}
