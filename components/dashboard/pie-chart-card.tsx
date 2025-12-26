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
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_COLORS } from "@/lib/chart-utils";

interface PieChartCardProps {
  title: string;
  description: string;
  data?: Array<{
    name: string;
    value: number;
  }>;
  valueLabel: string;
  categoryLabel: string;
  loading?: boolean;
  colorOrder?: string[];
}

export function PieChartCard({
  title,
  description,
  data,
  valueLabel,
  categoryLabel,
  loading,
  colorOrder,
}: PieChartCardProps) {
  const isLoading = loading || !data;

  const { chartConfig, chartData, topItem, topPercentage, itemCount } = useMemo(() => {
    if (!data) {
      return {
        chartConfig: {} as ChartConfig,
        chartData: [],
        topItem: "",
        topPercentage: 0,
        itemCount: 0,
      };
    }

    const config: ChartConfig = {
      value: {
        label: valueLabel,
      },
    };

    const filteredData = data.filter((item) => item.value > 0);
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);
    const sortedData = [...filteredData].sort((a, b) => b.value - a.value);
    const top = sortedData[0];

    const colorIndexMap = new Map<string, number>();
    if (colorOrder) {
      colorOrder.forEach((name, index) => {
        colorIndexMap.set(name, index);
      });
    } else {
      sortedData.forEach((item, index) => {
        colorIndexMap.set(item.name, index);
      });
    }

    const processedData = sortedData.map((item) => {
      const colorIndex = colorIndexMap.get(item.name) ?? sortedData.length;
      const colorVar = CHART_COLORS[colorIndex % CHART_COLORS.length];
      config[item.name] = {
        label: item.name,
        color: colorVar,
      };
      return {
        ...item,
        fill: `var(--color-${item.name})`,
      };
    });

    return {
      chartConfig: config,
      chartData: processedData,
      topItem: top?.name ?? "",
      topPercentage: total > 0 && top ? (top.value / total) * 100 : 0,
      itemCount: filteredData.length,
    };
  }, [data, valueLabel, colorOrder]);

  const isTokens = valueLabel.toLowerCase() === "tokens";
  const footerText = isTokens ? "leads with" : "accounts for";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] w-full rounded-md" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" className="flex-wrap" />}
                verticalAlign="bottom"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-52 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 font-medium leading-none">
                  {topItem} {footerText} {topPercentage.toFixed(1)}% of {valueLabel.toLowerCase()}
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  {itemCount} {categoryLabel}
                  {itemCount !== 1 ? "s" : ""} in total
                </div>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
