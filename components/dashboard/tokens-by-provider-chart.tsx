"use client";

import { useMemo } from "react";
import { PieChartCard } from "./pie-chart-card";
import type { ByProviderItem } from "@/lib/types";

interface TokensByProviderChartProps {
  data: ByProviderItem[];
}

export function TokensByProviderChart({ data }: TokensByProviderChartProps) {
  const chartData = useMemo(
    () => data.map((item) => ({ name: item.provider, value: item.tokens })),
    [data]
  );

  return (
    <PieChartCard
      title="Tokens by Provider"
      description="Token usage distribution"
      data={chartData}
      valueLabel="Tokens"
      categoryLabel="provider"
    />
  );
}
