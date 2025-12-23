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
import type { RequestsByModelItem } from "@/lib/types";

interface RequestsByModelChartProps {
  data: RequestsByModelItem[];
}

const chartConfig = {
  requests: {
    label: "Requests",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function truncateModelName(name: string, maxLength = 28): string {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
}

export function RequestsByModelChart({ data }: RequestsByModelChartProps) {
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
        <CardTitle>Requests by Model</CardTitle>
        <CardDescription>Top models by request count</CardDescription>
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
                    `${Number(value).toLocaleString()} requests`,
                    item.payload.model,
                  ]}
                />
              }
            />
            <Bar dataKey="requests" fill="var(--color-requests)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
