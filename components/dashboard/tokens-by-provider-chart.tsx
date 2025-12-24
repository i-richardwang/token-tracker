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

interface TokensByProviderChartProps {
  data: ByProviderItem[];
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export function TokensByProviderChart({ data }: TokensByProviderChartProps) {
  const { chartConfig, chartData, topProvider, topPercentage, providerCount } = useMemo(() => {
    const config: ChartConfig = {
      tokens: {
        label: "Tokens",
      },
    };
    // Filter out zero-value items
    const filteredData = data.filter((item) => item.tokens > 0);
    const totalTokens = filteredData.reduce((sum, item) => sum + item.tokens, 0);
    const sortedData = [...filteredData].sort((a, b) => b.tokens - a.tokens);
    const top = sortedData[0];

    const processedData = sortedData.map((item, index) => {
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
      topPercentage: totalTokens > 0 ? (top?.tokens / totalTokens) * 100 : 0,
      providerCount: filteredData.length,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens by Provider</CardTitle>
        <CardDescription>Token usage distribution</CardDescription>
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
              dataKey="tokens"
              nameKey="provider"
              innerRadius={50}
              outerRadius={80}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="provider" className="flex-wrap" />}
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {topProvider} leads with {topPercentage.toFixed(1)}% of tokens
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {providerCount} provider{providerCount !== 1 ? "s" : ""} in total
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
