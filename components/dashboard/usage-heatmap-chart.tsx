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
const CELL_SIZE = 12; // minimum cell size in pixels
const CELL_GAP = 2; // gap between cells
const DAY_LABEL_WIDTH = 28; // width reserved for day labels

interface DayData {
  date: string;
  requests: number;
}

type WeekDays = (DayData | null)[];

interface WeekData {
  days: WeekDays;
  monthStart: number | null;
}

function getIntensityClass(value: number, max: number): string {
  if (max === 0 || value === 0) return "bg-muted";
  const ratio = value / max;
  if (ratio < 0.25) return "bg-chart-1/30";
  if (ratio < 0.5) return "bg-chart-1/50";
  if (ratio < 0.75) return "bg-chart-1/75";
  return "bg-chart-1";
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
  const { weeks, maxRequests, totalRequests, activeDays, mostActiveDate } = useMemo(() => {
    // Build a map of date -> requests and calculate stats in single pass
    const dateMap = new Map<string, number>();
    let max = 0;
    let total = 0;
    let active = 0;
    let mostActive = { date: "", requests: 0 };

    for (const item of data) {
      dateMap.set(item.date, item.requests);
      total += item.requests;
      if (item.requests > 0) active++;
      if (item.requests > max) {
        max = item.requests;
        mostActive = { date: item.date, requests: item.requests };
      }
    }

    // Always show 1 year ending at today (like GitHub)
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
      maxRequests: max,
      totalRequests: total,
      activeDays: active,
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
              <div className="flex">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 mr-1">
                  {DAYS.map((day, i) => (
                    <div
                      key={day}
                      className="h-3 min-h-3 w-6 text-[10px] text-muted-foreground flex items-center"
                    >
                      {i % 2 === 1 ? day : ""}
                    </div>
                  ))}
                </div>

                {/* Weeks grid - responsive cells */}
                <div
                  className="grid flex-1 gap-0.5"
                  style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(${CELL_SIZE}px, 1fr))` }}
                >
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid gap-0.5" style={{ gridTemplateRows: `repeat(7, minmax(${CELL_SIZE}px, 1fr))` }}>
                      {week.days.map((day, dayIndex) => {
                        if (!day) {
                          return <div key={dayIndex} className="aspect-square min-w-3 min-h-3" />;
                        }
                        return (
                          <Tooltip key={dayIndex}>
                            <TooltipTrigger asChild>
                              <div
                                className={`aspect-square min-w-3 min-h-3 rounded-sm cursor-pointer transition-colors hover:ring-1 hover:ring-foreground/30 ${getIntensityClass(day.requests, maxRequests)}`}
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
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-chart-1/30" />
            <div className="w-3 h-3 rounded-sm bg-chart-1/50" />
            <div className="w-3 h-3 rounded-sm bg-chart-1/75" />
            <div className="w-3 h-3 rounded-sm bg-chart-1" />
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
