"use client";

import { useMemo } from "react";
import { PieChartCard } from "./pie-chart-card";
import type { ByBrandItem } from "@/lib/types";

interface TokensByBrandChartProps {
  data: ByBrandItem[];
}

export function TokensByBrandChart({ data }: TokensByBrandChartProps) {
  const chartData = useMemo(
    () => data.map((item) => ({ name: item.brand, value: item.tokens })),
    [data]
  );

  return (
    <PieChartCard
      title="Tokens by Brand"
      description="Token usage by model brand"
      data={chartData}
      valueLabel="Tokens"
      categoryLabel="brand"
    />
  );
}
