"use client";

import { useMemo, useState, useRef, type CSSProperties } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { HeatmapData, HeatmapItem } from "@/lib/types";
import { formatNumber } from "@/lib/chart-utils";

interface UsageHeatmapChartProps {
  data: HeatmapData;
}

type HeatmapMode = "requests" | "tokens";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CELL_SIZE = 12;
const CELL_GAP = 2;

const rowGridStyle = {
  gridTemplateRows: `repeat(7, minmax(${CELL_SIZE}px, 1fr))`,
  gap: `${CELL_GAP}px`,
} as const;

const INTENSITY_LEVELS = [
  "bg-muted",
  "bg-chart-1/30",
  "bg-chart-1/50",
  "bg-chart-1/75",
  "bg-chart-1",
] as const;

const CELL_CLASS = "aspect-square min-w-3 min-h-3 rounded-sm";

interface DayData {
  date: string;
  value: number;
}

type WeekDays = (DayData | null)[];

interface WeekData {
  days: WeekDays;
  monthStart: number | null;
}

interface Quartiles {
  q1: number;
  q2: number;
  q3: number;
}

interface TooltipData {
  day: DayData;
  cellRect: DOMRect;
  containerRect: DOMRect;
}

interface ProcessedHeatmap {
  weeks: WeekData[];
  quartiles: Quartiles;
  total: number;
  activeDays: number;
  mostActiveDate: { date: string; value: number };
}

function calculateQuartiles(values: number[]): Quartiles {
  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;
  return {
    q1: sorted[Math.floor(len * 0.25)] ?? 0,
    q2: sorted[Math.floor(len * 0.5)] ?? 0,
    q3: sorted[Math.floor(len * 0.75)] ?? 0,
  };
}

function getIntensityClass(value: number, quartiles: Quartiles): string {
  if (value === 0) return INTENSITY_LEVELS[0];
  if (value <= quartiles.q1) return INTENSITY_LEVELS[1];
  if (value <= quartiles.q2) return INTENSITY_LEVELS[2];
  if (value <= quartiles.q3) return INTENSITY_LEVELS[3];
  return INTENSITY_LEVELS[4];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function processHeatmapData(data: HeatmapItem[]): ProcessedHeatmap {
  const dateMap = new Map<string, number>();
  const nonZeroValues: number[] = [];
  let total = 0;
  let mostActive = { date: "", value: 0 };

  for (const item of data) {
    dateMap.set(item.date, item.value);
    total += item.value;
    if (item.value > 0) {
      nonZeroValues.push(item.value);
      if (item.value > mostActive.value) {
        mostActive = { date: item.date, value: item.value };
      }
    }
  }

  const quartiles = calculateQuartiles(nonZeroValues);

  // Show 1 year ending at today, aligned to week boundaries
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const adjustedStart = new Date(startDate);
  adjustedStart.setDate(adjustedStart.getDate() - adjustedStart.getDay());

  const adjustedEnd = new Date(endDate);
  adjustedEnd.setDate(adjustedEnd.getDate() + (6 - adjustedEnd.getDay()));

  const weeks: WeekData[] = [];
  let currentWeek: WeekDays = Array(7).fill(null);
  let currentMonthStart: number | null = null;
  let lastMonth: number | null = null;
  const current = new Date(adjustedStart);

  while (current <= adjustedEnd) {
    const dateStr = current.toISOString().split("T")[0];
    const dayOfWeek = current.getDay();
    const month = current.getMonth();
    const value = dateMap.get(dateStr) ?? 0;

    if (dayOfWeek === 0 && month !== lastMonth) {
      currentMonthStart = month;
      lastMonth = month;
    }

    currentWeek[dayOfWeek] = { date: dateStr, value };

    if (dayOfWeek === 6) {
      weeks.push({ days: currentWeek, monthStart: currentMonthStart });
      currentWeek = Array(7).fill(null);
      currentMonthStart = null;
    }

    current.setDate(current.getDate() + 1);
  }

  if (currentWeek.some((d) => d !== null)) {
    weeks.push({ days: currentWeek, monthStart: currentMonthStart });
  }

  return {
    weeks,
    quartiles,
    total,
    activeDays: nonZeroValues.length,
    mostActiveDate: mostActive,
  };
}

const MODE_CONFIG = {
  requests: {
    valueLabel: "Requests",
    formatValue: (v: number) => v.toLocaleString(),
    totalLabel: (t: number, d: number) =>
      `${t.toLocaleString()} requests across ${d} active days`,
  },
  tokens: {
    valueLabel: "Tokens",
    formatValue: (v: number) => formatNumber(v),
    totalLabel: (t: number, d: number) =>
      `${formatNumber(t)} tokens across ${d} active days`,
  },
} as const;

export function UsageHeatmapChart({ data }: UsageHeatmapChartProps) {
  const [mode, setMode] = useState<HeatmapMode>("requests");
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const requestsHeatmap = useMemo(
    () => processHeatmapData(data.requests),
    [data.requests]
  );
  const tokensHeatmap = useMemo(
    () => processHeatmapData(data.tokens),
    [data.tokens]
  );

  const activeData = mode === "requests" ? requestsHeatmap : tokensHeatmap;
  const { weeks, quartiles, total, activeDays, mostActiveDate } = activeData;
  const config = MODE_CONFIG[mode];

  if (weeks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Daily activity heatmap</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Daily activity heatmap</CardDescription>
          </div>
          <Tabs value={mode} onValueChange={(v) => setMode(v as HeatmapMode)}>
            <TabsList>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            className="flex flex-col gap-1"
            style={{
              minWidth: `${weeks.length * (CELL_SIZE + CELL_GAP) + 28}px`,
            }}
          >
            <div className="flex">
              <div className="w-7 shrink-0" />
              <div className="flex-1 relative h-4">
                {weeks.map((week, weekIndex) =>
                  week.monthStart !== null ? (
                    <span
                      key={weekIndex}
                      className="absolute text-[10px] text-muted-foreground whitespace-nowrap"
                      style={{ left: `${(weekIndex / weeks.length) * 100}%` }}
                    >
                      {MONTHS[week.monthStart]}
                    </span>
                  ) : null
                )}
              </div>
            </div>

            <div ref={gridRef} className="flex pb-0.5 pr-0.5">
              <div className="grid mr-1" style={rowGridStyle}>
                {DAYS.map((day, i) => (
                  <div
                    key={day}
                    className="w-6 text-[10px] text-muted-foreground flex items-center"
                  >
                    {i % 2 === 1 ? day : ""}
                  </div>
                ))}
              </div>

              <div
                className="grid flex-1"
                style={{
                  gridTemplateColumns: `repeat(${weeks.length}, minmax(${CELL_SIZE}px, 1fr))`,
                  gap: `${CELL_GAP}px`,
                }}
              >
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid" style={rowGridStyle}>
                    {week.days.map((day, dayIndex) => {
                      if (!day) {
                        return <div key={dayIndex} className={CELL_CLASS} />;
                      }
                      return (
                        <div
                          key={dayIndex}
                          className={`${CELL_CLASS} cursor-pointer transition-colors hover:ring-1 hover:ring-foreground/30 ${getIntensityClass(day.value, quartiles)}`}
                          onMouseEnter={(e) => {
                            const cellRect =
                              e.currentTarget.getBoundingClientRect();
                            const gridRect =
                              gridRef.current?.getBoundingClientRect();
                            if (gridRect) {
                              setTooltip({
                                day,
                                cellRect,
                                containerRect: gridRect,
                              });
                            }
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 mt-3">
          <span className="text-[10px] text-muted-foreground mr-1">Less</span>
          {INTENSITY_LEVELS.map((className, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${className}`} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">More</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {config.totalLabel(total, activeDays)}
            </div>
            {mostActiveDate.date && (
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Most active: {formatDate(mostActiveDate.date)} (
                {config.formatValue(mostActiveDate.value)})
              </div>
            )}
          </div>
        </div>
      </CardFooter>

      {tooltip &&
        (() => {
          const { cellRect, containerRect: gridRect } = tooltip;
          const tooltipWidth = 140;
          const tooltipHeight = 60;
          const offset = 8;

          const positiveX = cellRect.right + offset;
          const negativeX = cellRect.left - tooltipWidth - offset;
          const translateX =
            positiveX + tooltipWidth > gridRect.right
              ? Math.max(negativeX, gridRect.left)
              : Math.max(positiveX, gridRect.left);

          const positiveY = cellRect.bottom + offset;
          const negativeY = cellRect.top - tooltipHeight - offset;
          const translateY =
            positiveY + tooltipHeight > gridRect.bottom
              ? Math.max(negativeY, gridRect.top)
              : Math.max(positiveY, gridRect.top);

          return (
            <div
              className="pointer-events-none fixed z-50"
              style={{ left: translateX, top: translateY }}
            >
              <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-none border px-2.5 py-1.5 text-xs shadow-xl">
                <div className="flex w-full flex-wrap items-stretch gap-2">
                  <div
                    className="shrink-0 rounded-[2px] bg-(--color-bg) w-1"
                    style={{ "--color-bg": "var(--chart-1)" } as CSSProperties}
                  />
                  <div className="flex flex-1 items-end justify-between leading-none">
                    <div className="grid gap-1.5">
                      <span className="font-medium">
                        {formatDate(tooltip.day.date)}
                      </span>
                      <span className="text-muted-foreground">
                        {config.valueLabel}
                      </span>
                    </div>
                    <span className="text-foreground font-mono font-medium tabular-nums">
                      {config.formatValue(tooltip.day.value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </Card>
  );
}
