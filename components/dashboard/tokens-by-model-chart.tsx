"use client";

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
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
import type { TokensByModelItem } from "@/lib/types";
import { formatNumber } from "@/lib/chart-utils";

interface TokensByModelChartProps {
  data: TokensByModelItem[];
}

const chartConfig = {
  tokens: {
    label: "Tokens",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function truncateModelName(name: string, maxLength = 28): string {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
}

export function TokensByModelChart({ data }: TokensByModelChartProps) {
  const { chartData, topModel, topPercentage } = useMemo(() => {
    const totalTokens = data.reduce((sum, item) => sum + item.tokens, 0);
    const top = data[0];

    return {
      chartData: data.map((item) => ({
        ...item,
        shortModel: truncateModelName(item.model),
      })),
      topModel: top?.model ?? "",
      topPercentage: totalTokens > 0 ? (top?.tokens / totalTokens) * 100 : 0,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens by Model</CardTitle>
        <CardDescription>Top models by token usage</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: -20 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="shortModel"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={160}
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
                  formatter={(value) => formatNumber(Number(value))}
                />
              }
            />
            <Bar dataKey="tokens" fill="var(--color-tokens)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {truncateModelName(topModel, 20)} leads with {topPercentage.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing top {data.length} models
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
