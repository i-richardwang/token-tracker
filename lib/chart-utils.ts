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
    return `${Math.round(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return Math.round(value).toString();
}

/**
 * Format large numbers with K/M suffixes (1 decimal place for tooltip)
 */
export function formatNumberTooltip(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return Math.round(value).toString();
}

/**
 * Format cost value with dollar sign (2 decimal places)
 */
export function formatCost(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Format cost value for chart axis (no decimal places)
 */
export function formatCostAxis(value: number): string {
  return `$${Math.round(value)}`;
}

/**
 * Format cost value for tooltip (1 decimal place)
 */
export function formatCostTooltip(value: number): string {
  return `$${value.toFixed(1)}`;
}

/**
 * Format latency value (ms or s)
 */
export function formatLatency(ms: number): string {
  if (ms >= 1_000) {
    return `${Math.round(ms / 1_000)}s`;
  }
  return `${Math.round(ms)}ms`;
}

/**
 * Format TPS (tokens per second) - for display with unit
 */
export function formatTps(tps: number): string {
  return `${tps.toFixed(1)}/s`;
}

/**
 * Format TPS for chart axis (no decimal, K suffix for large numbers)
 */
export function formatTpsAxis(value: number): string {
  return value >= 1000 ? `${Math.round(value / 1000)}K` : Math.round(value).toString();
}

/**
 * Format TPS for tooltip (1 decimal place)
 */
export function formatTpsTooltip(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toFixed(1);
}

/**
 * Truncate long model names for chart display
 */
export function truncateModelName(name: string, maxLength = 28): string {
  return name.length > maxLength ? `${name.slice(0, maxLength)}…` : name;
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

/**
 * Format date for chart X-axis display
 * Converts YYYY-MM-DD to MM-DD, keeps HH:00 format as-is
 */
export function formatDateForChart(date: string): string {
  // If it's an hourly format (HH:00), keep as-is
  if (/^\d{2}:00$/.test(date)) {
    return date;
  }
  // If it's YYYY-MM-DD format, extract MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date.slice(5); // "2024-01-15" -> "01-15"
  }
  // Fallback: return as-is
  return date;
}
