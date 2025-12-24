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
import type { CostTrendItem } from "@/lib/types";
import { calculateTrend, getTimeRangeLabel } from "@/lib/chart-utils";

interface CostTrendChartProps {
  data: CostTrendItem[];
  timeRange: string;
}

const chartConfig = {
  cost: {
    label: "Cost",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function CostTrendChart({ data, timeRange }: CostTrendChartProps) {
  const trend = useMemo(
    () => calculateTrend(data.map((d) => d.cost)),
    [data]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Trend</CardTitle>
        <CardDescription>API costs over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <defs>
              <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cost)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cost)"
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
              tickFormatter={(value: number) => `$${value.toFixed(1)}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              type="natural"
              dataKey="cost"
              stroke="var(--color-cost)"
              fill="url(#fillCost)"
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
