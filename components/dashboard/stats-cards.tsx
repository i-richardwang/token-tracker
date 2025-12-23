"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary } from "@/lib/types";
import {
  Coins,
  Zap,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react";

interface StatsCardsProps {
  summary: DashboardSummary;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toFixed(0);
}

function formatCost(num: number): string {
  return "$" + num.toFixed(4);
}

function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return (ms / 1000).toFixed(2) + "s";
  }
  return ms.toFixed(0) + "ms";
}

export function StatsCards({ summary }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Tokens",
      value: formatNumber(summary.totalTokens),
      description: `${formatNumber(summary.promptTokens)} prompt / ${formatNumber(summary.completionTokens)} completion`,
      icon: Zap,
    },
    {
      title: "Total Cost",
      value: formatCost(summary.totalCost),
      description: "Accumulated cost",
      icon: Coins,
    },
    {
      title: "Requests",
      value: formatNumber(summary.totalRequests),
      description: "Total API calls",
      icon: Activity,
    },
    {
      title: "Avg Latency",
      value: formatLatency(summary.avgLatency),
      description: "Average response time",
      icon: Clock,
    },
    {
      title: "Success Rate",
      value: summary.successRate.toFixed(1) + "%",
      description: "Successful requests",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title} size="sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground font-normal">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
