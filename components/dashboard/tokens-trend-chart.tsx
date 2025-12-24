"use client";

import { useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
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
import type { TokensTrendItem } from "@/lib/types";
import {
  calculateTrend,
  formatNumber,
  getTimeRangeLabel,
} from "@/lib/chart-utils";

interface TokensTrendChartProps {
  data: TokensTrendItem[];
  timeRange: string;
}

const chartConfig = {
  tokens: {
    label: "Tokens",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TokensTrendChart({ data, timeRange }: TokensTrendChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        date: item.date,
        tokens: item.prompt + item.completion,
      })),
    [data]
  );

  const trend = useMemo(
    () => calculateTrend(chartData.map((d) => d.tokens)),
    [chartData]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens Trend</CardTitle>
        <CardDescription>Total token usage over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <defs>
              <linearGradient id="fillTokens" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-tokens)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tokens)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatNumber}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              type="natural"
              dataKey="tokens"
              stroke="var(--color-tokens)"
              fill="url(#fillTokens)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend.isUp ? "Trending up" : "Trending down"} by{" "}
              {trend.percentage.toFixed(1)}% this period
              {trend.isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {getTimeRangeLabel(timeRange)}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
