"use client";

import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ByProviderItem } from "@/lib/types";

interface CostByProviderChartProps {
  data: ByProviderItem[];
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

function formatCost(value: number): string {
  return "$" + value.toFixed(1);
}

export function CostByProviderChart({ data }: CostByProviderChartProps) {
  const { chartConfig, chartData } = useMemo(() => {
    const config: ChartConfig = {};
    const processedData = data.map((item, index) => {
      const colorVar = CHART_COLORS[index % CHART_COLORS.length];
      config[item.provider] = {
        label: item.provider,
        color: colorVar,
      };
      return {
        ...item,
        fill: `var(--color-${item.provider})`,
      };
    });
    return { chartConfig: config, chartData: processedData };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost by Provider</CardTitle>
        <CardDescription>Cost distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => formatCost(Number(value))}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="cost"
              nameKey="provider"
              innerRadius={50}
              outerRadius={80}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="provider" />}
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
