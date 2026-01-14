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
import { formatCostTooltip } from "@/lib/chart-utils";
import type { ByBrandItem } from "@/lib/types";

interface CostByBrandChartProps {
  data?: ByBrandItem[];
  loading?: boolean;
}

const chartConfig = {
  cost: {
    label: "Cost",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function CostByBrandChart({ data, loading }: CostByBrandChartProps) {
  const isLoading = loading || !data;

  const { chartData, topBrand, topPercentage, brandCount } = useMemo(() => {
    if (!data) {
      return { chartData: [], topBrand: "", topPercentage: 0, brandCount: 0 };
    }

    const sorted = [...data].sort((a, b) => b.cost - a.cost);
    const totalCost = sorted.reduce((sum, item) => sum + item.cost, 0);
    const top = sorted[0];

    return {
      chartData: sorted.map((item) => ({
        brand: item.brand,
        cost: item.cost,
      })),
      topBrand: top?.brand ?? "",
      topPercentage: totalCost > 0 ? (top?.cost / totalCost) * 100 : 0,
      brandCount: sorted.length,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost by Brand</CardTitle>
        <CardDescription>Cost distribution by model brand</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[350px] w-full rounded-md" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: -20 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="brand"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={100}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" valueFormatter={formatCostTooltip} />}
              />
              <Bar dataKey="cost" fill="var(--color-cost)" radius={5} />
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
                  {topBrand} leads with {topPercentage.toFixed(1)}%
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  Showing {brandCount} brands
                </div>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
