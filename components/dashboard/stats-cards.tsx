"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary } from "@/lib/types";
import {
  formatNumber,
  formatCost,
  formatLatency,
  formatTps,
} from "@/lib/chart-utils";
import {
  Activity,
  Zap,
  DollarSign,
  CheckCircle,
  Hash,
  Gauge,
  Clock,
  Receipt,
} from "lucide-react";

interface StatsCardsProps {
  summary: DashboardSummary;
}

export function StatsCards({ summary }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Requests",
      value: formatNumber(summary.totalRequests),
      description: "API calls made",
      icon: Activity,
    },
    {
      title: "Total Tokens",
      value: formatNumber(summary.totalTokens),
      description: `${formatNumber(summary.completionTokens)} completion`,
      icon: Zap,
    },
    {
      title: "Total Cost",
      value: formatCost(summary.totalCost),
      description: "Accumulated spending",
      icon: DollarSign,
    },
    {
      title: "Success Rate",
      value: summary.successRate.toFixed(1) + "%",
      description: "Successful requests",
      icon: CheckCircle,
    },
    {
      title: "Avg Tokens/Req",
      value: formatNumber(summary.avgTokensPerRequest),
      description: "Tokens per request",
      icon: Hash,
    },
    {
      title: "Avg TPS",
      value: formatTps(summary.avgTps),
      description: "Tokens per second",
      icon: Gauge,
    },
    {
      title: "Avg Latency",
      value: formatLatency(summary.avgLatency),
      description: "Response time",
      icon: Clock,
    },
    {
      title: "Avg Cost/Req",
      value: formatCost(summary.avgCostPerRequest),
      description: "Cost per request",
      icon: Receipt,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
