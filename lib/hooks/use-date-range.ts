"use client";

import { useQueryStates, parseAsIsoDate, parseAsStringLiteral } from "nuqs";
import { useCallback, useMemo } from "react";
import type { DateRangeValue } from "@/lib/types";

const TIME_RANGE_PRESETS = ["1d", "7d", "30d", "all"] as const;
const DEFAULT_PRESET = "7d";

const dateRangeSearchParams = {
  range: parseAsStringLiteral(TIME_RANGE_PRESETS),
  from: parseAsIsoDate,
  to: parseAsIsoDate,
};

export function useDateRange() {
  const [params, setParams] = useQueryStates(dateRangeSearchParams, {
    history: "push",
  });

  const value: DateRangeValue = useMemo(() => {
    if (params.from && params.to) {
      return { type: "custom", from: params.from, to: params.to };
    }
    return { type: "preset", value: params.range ?? DEFAULT_PRESET };
  }, [params.range, params.from, params.to]);

  const setValue = useCallback(
    (newValue: DateRangeValue) => {
      if (newValue.type === "preset") {
        setParams({
          range: newValue.value as (typeof TIME_RANGE_PRESETS)[number],
          from: null,
          to: null,
        });
      } else {
        setParams({
          range: null,
          from: newValue.from,
          to: newValue.to,
        });
      }
    },
    [setParams]
  );

  return [value, setValue] as const;
}
