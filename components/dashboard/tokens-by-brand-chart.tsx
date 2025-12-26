"use client";

import { useMemo } from "react";
import { PieChartCard } from "./pie-chart-card";
import type { ByBrandItem } from "@/lib/types";

interface TokensByBrandChartProps {
  data?: ByBrandItem[];
  loading?: boolean;
}

export function TokensByBrandChart({ data, loading }: TokensByBrandChartProps) {
  const { chartData, colorOrder } = useMemo(() => {
    if (!data) return { chartData: undefined, colorOrder: undefined };
    const sorted = [...data].sort((a, b) => b.tokens - a.tokens);
    return {
      chartData: data.map((item) => ({ name: item.brand, value: item.tokens })),
      colorOrder: sorted.map((item) => item.brand),
    };
  }, [data]);

  return (
    <PieChartCard
      title="Tokens by Brand"
      description="Token usage by model brand"
      data={chartData}
      valueLabel="Tokens"
      categoryLabel="brand"
      loading={loading}
      colorOrder={colorOrder}
    />
  );
}
