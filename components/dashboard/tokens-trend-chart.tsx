"use client";

import { useMemo } from "react";
import { AreaTrendChart } from "./area-trend-chart";
import type { TokensTrendItem } from "@/lib/types";

interface TokensTrendChartProps {
  data: TokensTrendItem[];
  timeRange: string;
}

export function TokensTrendChart({ data, timeRange }: TokensTrendChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
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
    />
  );
}
