"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
import type { TokenTrendItem } from "@/lib/types";

interface TokenTrendChartProps {
  data: TokenTrendItem[];
}

const chartConfig = {
  prompt: {
    label: "Prompt Tokens",
    color: "var(--chart-1)",
  },
  completion: {
    label: "Completion Tokens",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function formatAxisValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

export function TokenTrendChart({ data }: TokenTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage Trend</CardTitle>
        <CardDescription>Prompt and completion tokens over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatAxisValue}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="natural"
              dataKey="prompt"
              stroke="var(--color-prompt)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="natural"
              dataKey="completion"
              stroke="var(--color-completion)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
