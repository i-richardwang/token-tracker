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
  CardFooter,
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

export function CostByProviderChart({ data }: CostByProviderChartProps) {
  const { chartConfig, chartData, topProvider, topPercentage } = useMemo(() => {
    const config: ChartConfig = {
      cost: {
        label: "Cost",
      },
    };
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
    const sortedData = [...data].sort((a, b) => b.cost - a.cost);
    const top = sortedData[0];

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

    return {
      chartConfig: config,
      chartData: processedData,
      topProvider: top?.provider ?? "",
      topPercentage: totalCost > 0 ? (top?.cost / totalCost) * 100 : 0,
    };
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
              content={<ChartTooltipContent indicator="dot" hideLabel />}
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
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {topProvider} accounts for {topPercentage.toFixed(1)}% of cost
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {data.length} provider{data.length !== 1 ? "s" : ""} in total
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
