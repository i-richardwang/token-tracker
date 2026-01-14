"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { formatNumber, formatNumberTooltip, truncateModelName } from "@/lib/chart-utils";
import type { TokensByModelItem } from "@/lib/types";

interface TokensByModelChartProps {
  data?: TokensByModelItem[];
  loading?: boolean;
}

const chartConfig = {
  tokens: {
    label: "Tokens",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TokensByModelChart({ data, loading }: TokensByModelChartProps) {
  const isLoading = loading || !data;

  const { chartData, topModel, topPercentage, modelCount } = useMemo(() => {
    if (!data) {
      return { chartData: [], topModel: "", topPercentage: 0, modelCount: 0 };
    }

    const totalTokens = data.reduce((sum, item) => sum + item.tokens, 0);
    const top = data[0];

    return {
      chartData: data.map((item) => ({
        ...item,
        shortModel: truncateModelName(item.model),
      })),
      topModel: top?.model ?? "",
      topPercentage: totalTokens > 0 ? (top?.tokens / totalTokens) * 100 : 0,
      modelCount: data.length,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens by Model</CardTitle>
        <CardDescription>Top models by token usage</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[350px] w-full rounded-md" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="shortModel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={120}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatNumber}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.model ?? "";
                    }}
                    valueFormatter={formatNumberTooltip}
                  />
                }
              />
              <Bar dataKey="tokens" fill="var(--color-tokens)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-4 w-36 rounded-md" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 font-medium leading-none">
                  {truncateModelName(topModel, 20)} leads with {topPercentage.toFixed(1)}%
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  Showing top {modelCount} models
                </div>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
