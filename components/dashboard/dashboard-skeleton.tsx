"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

const STAT_ICONS = [Activity, Zap, DollarSign, CheckCircle, Hash, Gauge, Clock, Receipt];
const STAT_TITLES = [
  "Total Requests",
  "Total Tokens",
  "Total Cost",
  "Success Rate",
  "Avg Tokens/Req",
  "Avg TPS",
  "Avg Latency",
  "Avg Cost/Req",
];

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {STAT_ICONS.map((Icon, i) => (
          <Card key={i} size="sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground font-normal">
                {STAT_TITLES[i]}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 rounded-md mb-1" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-md" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
