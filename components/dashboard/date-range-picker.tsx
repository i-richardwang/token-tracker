"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover";
import type { DateRangeValue } from "@/lib/types";

interface DateRangePickerProps {
  value: DateRangeValue;
  onValueChange: (value: DateRangeValue) => void;
}

const PRESETS = [
  { value: "1d", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
] as const;

function formatDisplayValue(value: DateRangeValue): string {
  if (value.type === "preset") {
    return PRESETS.find((p) => p.value === value.value)?.label ?? "Select range";
  }
  return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`;
}

export function DateRangePicker({ value, onValueChange }: DateRangePickerProps) {
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>();
  const [clickCount, setClickCount] = React.useState(0);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setClickCount(0);
      setTempRange(
        value.type === "custom" ? { from: value.from, to: value.to } : undefined
      );
    }
  };

  const handlePresetSelect = (presetValue: string) => {
    onValueChange({ type: "preset", value: presetValue });
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    setTempRange(range);

    if (newClickCount >= 2 && range?.from && range?.to) {
      onValueChange({ type: "custom", from: range.from, to: range.to });
      closeRef.current?.click();
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-auto justify-start font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue(value)}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="end" sideOffset={4}>
        <div className="flex">
          <div className="flex flex-col gap-1 border-r p-3">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Quick Select
            </p>
            {PRESETS.map((preset) => (
              <PopoverClose key={preset.value} asChild>
                <Button
                  variant={
                    value.type === "preset" && value.value === preset.value
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePresetSelect(preset.value)}
                >
                  {preset.label}
                </Button>
              </PopoverClose>
            ))}
          </div>

          <div className="p-3">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Custom Range
            </p>
            <Calendar
              mode="range"
              defaultMonth={value.type === "custom" ? value.from : undefined}
              selected={tempRange}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
          </div>
        </div>

        <PopoverClose ref={closeRef} className="hidden" />
      </PopoverContent>
    </Popover>
  );
}
