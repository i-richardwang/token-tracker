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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StatusDistributionItem } from "@/lib/types";

interface StatusPieChartProps {
  data: StatusDistributionItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  success: { label: "Success", color: "var(--chart-2)" },
  error: { label: "Error", color: "var(--chart-5)" },
  pending: { label: "Pending", color: "var(--chart-3)" },
};

const DEFAULT_STATUS_CONFIG = { label: "Unknown", color: "var(--chart-4)" };

export function StatusPieChart({ data }: StatusPieChartProps) {
  const { chartConfig, chartData } = useMemo(() => {
    const config: ChartConfig = {};
    const processedData = data.map((item) => {
      const statusConfig = STATUS_CONFIG[item.status] ?? DEFAULT_STATUS_CONFIG;
      config[item.status] = statusConfig;
      return {
        ...item,
        fill: `var(--color-${item.status})`,
      };
    });
    return { chartConfig: config, chartData: processedData };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Status</CardTitle>
        <CardDescription>Success vs error rate</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              outerRadius={80}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
