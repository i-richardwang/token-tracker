"use client";

import { useMemo } from "react";
import { PieChartCard } from "./pie-chart-card";
import type { ByBrandItem } from "@/lib/types";

interface CostByBrandChartProps {
  data?: ByBrandItem[];
  loading?: boolean;
}

export function CostByBrandChart({ data, loading }: CostByBrandChartProps) {
  const { chartData, colorOrder } = useMemo(() => {
    if (!data) return { chartData: undefined, colorOrder: undefined };
    const sortedByTokens = [...data].sort((a, b) => b.tokens - a.tokens);
    return {
      chartData: data.map((item) => ({ name: item.brand, value: item.cost })),
      colorOrder: sortedByTokens.map((item) => item.brand),
    };
  }, [data]);

  return (
    <PieChartCard
      title="Cost by Brand"
      description="Cost distribution by model brand"
      data={chartData}
      valueLabel="Cost"
      categoryLabel="brand"
      loading={loading}
      colorOrder={colorOrder}
    />
  );
}
