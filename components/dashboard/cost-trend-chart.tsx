"use client";

import { useMemo } from "react";
import { AreaTrendChart } from "./area-trend-chart";
import { formatCostAxis, formatCostTooltip } from "@/lib/chart-utils";
import type { CostTrendItem } from "@/lib/types";

interface CostTrendChartProps {
  data?: CostTrendItem[];
  timeRange?: string;
  loading?: boolean;
}

export function CostTrendChart({ data, timeRange, loading }: CostTrendChartProps) {
  const chartData = useMemo(
    () => data?.map((item) => ({ date: item.date, value: item.cost })),
    [data]
  );

  return (
    <AreaTrendChart
      title="Cost Trend"
      description="API costs over time"
      data={chartData}
      timeRange={timeRange}
      yAxisFormatter={formatCostAxis}
      tooltipFormatter={formatCostAxis}
      loading={loading}
    />
  );
}
