"use client";

import { useMemo } from "react";
import { PieChartCard } from "./pie-chart-card";
import type { ByBrandItem } from "@/lib/types";

interface CostByBrandChartProps {
  data: ByBrandItem[];
}

export function CostByBrandChart({ data }: CostByBrandChartProps) {
  const chartData = useMemo(
    () => data.map((item) => ({ name: item.brand, value: item.cost })),
    [data]
  );

  return (
    <PieChartCard
      title="Cost by Brand"
      description="Cost distribution by model brand"
      data={chartData}
      valueLabel="Cost"
      categoryLabel="brand"
    />
  );
}
