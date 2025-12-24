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
import { CHART_COLORS } from "@/lib/chart-utils";

interface PieChartCardProps {
  title: string;
  description: string;
  data: Array<{
    name: string;
    value: number;
  }>;
  valueLabel: string;
  categoryLabel: string;
}

export function PieChartCard({
  title,
  description,
  data,
  valueLabel,
  categoryLabel,
}: PieChartCardProps) {
  const { chartConfig, chartData, topItem, topPercentage, itemCount } = useMemo(() => {
    const config: ChartConfig = {
      value: {
        label: valueLabel,
      },
    };

    // Filter out zero-value items
    const filteredData = data.filter((item) => item.value > 0);
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);
    const sortedData = [...filteredData].sort((a, b) => b.value - a.value);
    const top = sortedData[0];

    const processedData = sortedData.map((item, index) => {
      const colorVar = CHART_COLORS[index % CHART_COLORS.length];
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
  }, [data, valueLabel]);

  const isTokens = valueLabel.toLowerCase() === "tokens";
  const footerText = isTokens ? "leads with" : "accounts for";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {topItem} {footerText} {topPercentage.toFixed(1)}% of {valueLabel.toLowerCase()}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {itemCount} {categoryLabel}
              {itemCount !== 1 ? "s" : ""} in total
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
