"use client";

import { useMemo } from "react";
import { PieChartCard } from "./pie-chart-card";
import type { ByProviderItem } from "@/lib/types";

interface CostByProviderChartProps {
  data?: ByProviderItem[];
  loading?: boolean;
}

export function CostByProviderChart({ data, loading }: CostByProviderChartProps) {
  const chartData = useMemo(
    () => data?.map((item) => ({ name: item.provider, value: item.cost })),
    [data]
  );

  return (
    <PieChartCard
      title="Cost by Provider"
      description="Cost distribution"
      data={chartData}
      valueLabel="Cost"
      categoryLabel="provider"
      loading={loading}
    />
  );
}
