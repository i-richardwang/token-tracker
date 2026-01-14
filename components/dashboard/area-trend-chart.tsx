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
import { Skeleton } from "@/components/ui/skeleton";
import {
  calculateTrend,
  formatNumber,
  formatNumberTooltip,
  getTimeRangeLabel,
  formatDateForChart,
} from "@/lib/chart-utils";

interface AreaTrendChartProps {
  title: string;
  description: string;
  data?: Array<{
    date: string;
    value: number;
  }>;
  timeRange?: string;
  color?: string;
  height?: number;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  gradientId?: string;
  loading?: boolean;
}

export function AreaTrendChart({
  title,
  description,
  data,
  timeRange,
  color = "var(--chart-1)",
  height = 250,
  yAxisFormatter = formatNumber,
  tooltipFormatter = formatNumberTooltip,
  gradientId,
  loading,
}: AreaTrendChartProps) {
  const isLoading = loading || !data || !timeRange;

  const chartConfig = useMemo(
    () =>
      ({
        value: {
          label: title.replace(" Trend", ""),
          color,
        },
      }) satisfies ChartConfig,
    [title, color]
  );

  const trend = useMemo(
    () => (data ? calculateTrend(data.map((d) => d.value)) : { isUp: true, percentage: 0 }),
    [data]
  );

  const uniqueGradientId = gradientId ?? `fill${title.replace(/\s+/g, "")}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full rounded-md" style={{ height }} />
        ) : (
          <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12 }}
            >
              <defs>
                <linearGradient id={uniqueGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
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
                tickFormatter={formatDateForChart}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={yAxisFormatter}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" valueFormatter={tooltipFormatter} />}
              />
              <Area
                type="natural"
                dataKey="value"
                stroke="var(--color-value)"
                fill={`url(#${uniqueGradientId})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
