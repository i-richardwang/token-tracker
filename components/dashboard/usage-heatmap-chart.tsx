"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UsageHeatmapItem } from "@/lib/types";

interface UsageHeatmapChartProps {
  data: UsageHeatmapItem[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Grid sizing constants
const CELL_SIZE = 12;
const CELL_GAP = 2;
const DAY_LABEL_WIDTH = 28;

// Shared grid styles
const rowGridStyle = {
  gridTemplateRows: `repeat(7, minmax(${CELL_SIZE}px, 1fr))`,
  gap: `${CELL_GAP}px`,
} as const;

// Intensity levels for legend display
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
  requests: number;
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

export function UsageHeatmapChart({ data }: UsageHeatmapChartProps) {
  const { weeks, quartiles, totalRequests, activeDays, mostActiveDate } = useMemo(() => {
    // Build a map of date -> requests and calculate stats in single pass
    const dateMap = new Map<string, number>();
    const nonZeroValues: number[] = [];
    let total = 0;
    let mostActive = { date: "", requests: 0 };

    for (const item of data) {
      dateMap.set(item.date, item.requests);
      total += item.requests;
      if (item.requests > 0) {
        nonZeroValues.push(item.requests);
        if (item.requests > mostActive.requests) {
          mostActive = { date: item.date, requests: item.requests };
        }
      }
    }

    // Calculate quartiles from non-zero values
    const q = calculateQuartiles(nonZeroValues);

    // Always show 1 year ending at today
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Adjust start to Sunday of that week
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() - adjustedStart.getDay());

    // Adjust end to Saturday of that week
    const adjustedEnd = new Date(endDate);
    adjustedEnd.setDate(adjustedEnd.getDate() + (6 - adjustedEnd.getDay()));

    // Build weeks array with month info
    const weeksData: WeekData[] = [];
    let currentWeek: WeekDays = Array(7).fill(null);
    let currentMonthStart: number | null = null;
    let lastMonth: number | null = null;
    const current = new Date(adjustedStart);

    while (current <= adjustedEnd) {
      const dateStr = current.toISOString().split("T")[0];
      const dayOfWeek = current.getDay();
      const month = current.getMonth();
      const requests = dateMap.get(dateStr) ?? 0;

      if (dayOfWeek === 0 && month !== lastMonth) {
        currentMonthStart = month;
        lastMonth = month;
      }

      currentWeek[dayOfWeek] = { date: dateStr, requests };

      if (dayOfWeek === 6) {
        weeksData.push({ days: currentWeek, monthStart: currentMonthStart });
        currentWeek = Array(7).fill(null);
        currentMonthStart = null;
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.some((d) => d !== null)) {
      weeksData.push({ days: currentWeek, monthStart: currentMonthStart });
    }

    return {
      weeks: weeksData,
      quartiles: q,
      totalRequests: total,
      activeDays: nonZeroValues.length,
      mostActiveDate: mostActive,
    };
  }, [data]);

  if (weeks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Daily request activity</CardDescription>
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
        <CardTitle>Activity</CardTitle>
        <CardDescription>Daily request activity</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            {/* Fixed min-width container so month labels and grid scroll together */}
            <div
              className="flex flex-col gap-1"
              style={{ minWidth: `${weeks.length * (CELL_SIZE + CELL_GAP) + DAY_LABEL_WIDTH}px` }}
            >
              {/* Month labels row */}
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

              {/* Grid */}
              <div className="flex pb-0.5">
                {/* Day labels - use grid to match cell sizing */}
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

                {/* Weeks grid - responsive cells */}
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
                          <Tooltip key={dayIndex}>
                            <TooltipTrigger asChild>
                              <div
                                className={`${CELL_CLASS} cursor-pointer transition-colors hover:ring-1 hover:ring-foreground/30 ${getIntensityClass(day.requests, quartiles)}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">{formatDate(day.date)}</p>
                              <p className="text-muted-foreground">
                                {day.requests.toLocaleString()} requests
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[10px] text-muted-foreground mr-1">Less</span>
            {INTENSITY_LEVELS.map((className, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${className}`} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">More</span>
          </div>
        </TooltipProvider>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {totalRequests.toLocaleString()} requests across {activeDays} active days
            </div>
            {mostActiveDate.date && (
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Most active: {formatDate(mostActiveDate.date)} ({mostActiveDate.requests.toLocaleString()})
              </div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
