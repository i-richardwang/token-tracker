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
import { Skeleton } from "@/components/ui/skeleton";
import type { TpsByModelItem } from "@/lib/types";

interface TpsByModelChartProps {
  data?: TpsByModelItem[];
  loading?: boolean;
}

const chartConfig = {
  tps: {
    label: "TPS",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function truncateModelName(name: string, maxLength = 28): string {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
}

export function TpsByModelChart({ data, loading }: TpsByModelChartProps) {
  const isLoading = loading || !data;

  const { chartData, fastestModel, fastestTps, modelCount } = useMemo(() => {
    if (!data) {
      return { chartData: [], fastestModel: "", fastestTps: 0, modelCount: 0 };
    }

    const top = data[0];

    return {
      chartData: data.map((item) => ({
        ...item,
        shortModel: truncateModelName(item.model),
      })),
      fastestModel: top?.model ?? "",
      fastestTps: top?.tps ?? 0,
      modelCount: data.length,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>TPS by Model</CardTitle>
        <CardDescription>Tokens per second ranking</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] w-full rounded-md" />
        ) : (
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
                  />
                }
              />
              <Bar dataKey="tps" fill="var(--color-tps)" radius={5} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-52 rounded-md" />
                <Skeleton className="h-4 w-36 rounded-md" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 font-medium leading-none">
                  {truncateModelName(fastestModel, 20)} is fastest at {fastestTps.toFixed(1)} tok/s
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
