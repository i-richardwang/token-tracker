/**
 * Shared chart color palette
 */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

/**
 * Calculate trend percentage change between two halves of data
 */
export function calculateTrend(data: number[]): {
  percentage: number;
  isUp: boolean;
} {
  if (data.length < 2) {
    return { percentage: 0, isUp: true };
  }

  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  const firstSum = firstHalf.reduce((a, b) => a + b, 0);
  const secondSum = secondHalf.reduce((a, b) => a + b, 0);

  if (firstSum === 0) {
    return { percentage: secondSum > 0 ? 100 : 0, isUp: true };
  }

  const percentage = ((secondSum - firstSum) / firstSum) * 100;
  return {
    percentage: Math.abs(percentage),
    isUp: percentage >= 0,
  };
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

/**
 * Format cost value with dollar sign (2 decimal places)
 */
export function formatCost(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Format cost value for chart axis (1 decimal place)
 */
export function formatCostAxis(value: number): string {
  return `$${value.toFixed(1)}`;
}

/**
 * Format latency value (ms or s)
 */
export function formatLatency(ms: number): string {
  if (ms >= 1_000) {
    return `${(ms / 1_000).toFixed(1)}s`;
  }
  return `${ms.toFixed(0)}ms`;
}

/**
 * Format TPS (tokens per second)
 */
export function formatTps(tps: number): string {
  return `${tps.toFixed(1)}/s`;
}

/**
 * Get human-readable time range label
 */
export function getTimeRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    "1d": "Last 24 hours",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    all: "All time",
    custom: "Selected period",
  };
  return labels[range] ?? labels["7d"];
}
