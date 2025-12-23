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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TpsByModelItem } from "@/lib/types";

interface TpsByModelChartProps {
  data: TpsByModelItem[];
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

function formatTps(value: number): string {
  return value.toFixed(1);
}

export function TpsByModelChart({ data }: TpsByModelChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        shortModel: truncateModelName(item.model),
      })),
    [data]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>TPS by Model</CardTitle>
        <CardDescription>Tokens per second ranking</CardDescription>
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
                  formatter={(value, _name, item) => [
                    `${formatTps(Number(value))} tokens/s`,
                    item.payload.model,
                  ]}
                />
              }
            />
            <Bar dataKey="tps" fill="var(--color-tps)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
