"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  type LucideIcon,
} from "lucide-react";

interface StatsCardsProps {
  summary?: DashboardSummary;
  loading?: boolean;
}

interface StatConfig {
  title: string;
  icon: LucideIcon;
  getValue: (s: DashboardSummary) => string;
  getDescription: (s: DashboardSummary) => string;
}

const STATS_CONFIG: StatConfig[] = [
  {
    title: "Total Requests",
    icon: Activity,
    getValue: (s) => formatNumber(s.totalRequests),
    getDescription: () => "API calls made",
  },
  {
    title: "Total Tokens",
    icon: Zap,
    getValue: (s) => formatNumber(s.totalTokens),
    getDescription: (s) => `${formatNumber(s.completionTokens)} completion`,
  },
  {
    title: "Total Cost",
    icon: DollarSign,
    getValue: (s) => formatCost(s.totalCost),
    getDescription: () => "Accumulated spending",
  },
  {
    title: "Success Rate",
    icon: CheckCircle,
    getValue: (s) => `${s.successRate.toFixed(1)}%`,
    getDescription: () => "Successful requests",
  },
  {
    title: "Avg Tokens/Req",
    icon: Hash,
    getValue: (s) => formatNumber(s.avgTokensPerRequest),
    getDescription: () => "Tokens per request",
  },
  {
    title: "Avg TPS",
    icon: Gauge,
    getValue: (s) => formatTps(s.avgTps),
    getDescription: () => "Tokens per second",
  },
  {
    title: "Avg Latency",
    icon: Clock,
    getValue: (s) => formatLatency(s.avgLatency),
    getDescription: () => "Response time",
  },
  {
    title: "Avg Cost/Req",
    icon: Receipt,
    getValue: (s) => formatCost(s.avgCostPerRequest),
    getDescription: () => "Cost per request",
  },
];

export function StatsCards({ summary, loading }: StatsCardsProps) {
  const isLoading = loading || !summary;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {STATS_CONFIG.map((stat) => (
        <Card key={stat.title} size="sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground font-normal">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20 rounded-md mb-1" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.getValue(summary)}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.getDescription(summary)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
