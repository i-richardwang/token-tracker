"use client";

import { useMemo } from "react";
import { PieChartCard } from "./pie-chart-card";
import type { ByProviderItem } from "@/lib/types";

interface CostByProviderChartProps {
  data?: ByProviderItem[];
  loading?: boolean;
}

export function CostByProviderChart({ data, loading }: CostByProviderChartProps) {
  const { chartData, colorOrder } = useMemo(() => {
    if (!data) return { chartData: undefined, colorOrder: undefined };
    const sortedByTokens = [...data].sort((a, b) => b.tokens - a.tokens);
    return {
      chartData: data.map((item) => ({ name: item.provider, value: item.cost })),
      colorOrder: sortedByTokens.map((item) => item.provider),
    };
  }, [data]);

  return (
    <PieChartCard
      title="Cost by Provider"
      description="Cost distribution"
      data={chartData}
      valueLabel="Cost"
      categoryLabel="provider"
      loading={loading}
      colorOrder={colorOrder}
    />
  );
}
