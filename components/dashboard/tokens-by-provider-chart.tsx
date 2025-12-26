"use client";

import { useMemo } from "react";
import { PieChartCard } from "./pie-chart-card";
import type { ByProviderItem } from "@/lib/types";

interface TokensByProviderChartProps {
  data?: ByProviderItem[];
  loading?: boolean;
}

export function TokensByProviderChart({ data, loading }: TokensByProviderChartProps) {
  const { chartData, colorOrder } = useMemo(() => {
    if (!data) return { chartData: undefined, colorOrder: undefined };
    const sorted = [...data].sort((a, b) => b.tokens - a.tokens);
    return {
      chartData: data.map((item) => ({ name: item.provider, value: item.tokens })),
      colorOrder: sorted.map((item) => item.provider),
    };
  }, [data]);

  return (
    <PieChartCard
      title="Tokens by Provider"
      description="Token usage distribution"
      data={chartData}
      valueLabel="Tokens"
      categoryLabel="provider"
      loading={loading}
      colorOrder={colorOrder}
    />
  );
}
