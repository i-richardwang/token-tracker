import { z } from "zod";

// ============================================
// Request Schemas
// ============================================

/**
 * Time range preset values
 */
export const TimeRangeEnum = z.enum(["1d", "7d", "30d", "all"]);

/**
 * Dashboard API query parameters schema
 * Supports two modes:
 * 1. Using preset time range (range)
 * 2. Using custom date range (from + to)
 */
export const DashboardQuerySchema = z
  .object({
    range: TimeRangeEnum.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      // from and to must both be present or both be absent
      const hasFrom = data.from !== undefined;
      const hasTo = data.to !== undefined;
      return hasFrom === hasTo;
    },
    { error: "Both 'from' and 'to' must be provided together", path: ["from"] }
  )
  .refine(
    (data) => {
      // If both from and to are provided, from must be before or equal to to
      if (data.from && data.to) {
        return data.from <= data.to;
      }
      return true;
    },
    { error: "'from' must be before or equal to 'to'", path: ["from"] }
  );

// ============================================
// Response Schemas
// ============================================

/**
 * Dashboard summary statistics schema
 */
export const DashboardSummarySchema = z.object({
  totalRequests: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  totalCost: z.number().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  avgLatency: z.number().nonnegative(),
  avgTps: z.number().nonnegative(),
  avgTokensPerRequest: z.number().nonnegative(),
  avgCostPerRequest: z.number().nonnegative(),
  successRate: z.number().min(0).max(100),
});

/**
 * Tokens trend data item schema
 */
export const TokensTrendItemSchema = z.object({
  date: z.string(),
  prompt: z.number().int().nonnegative(),
  completion: z.number().int().nonnegative(),
});

/**
 * Cost trend data item schema
 */
export const CostTrendItemSchema = z.object({
  date: z.string(),
  cost: z.number().nonnegative(),
});

/**
 * Requests trend data item schema
 */
export const RequestsTrendItemSchema = z.object({
  date: z.string(),
  requests: z.number().int().nonnegative(),
});

/**
 * By provider data item schema
 */
export const ByProviderItemSchema = z.object({
  provider: z.string(),
  tokens: z.number().int().nonnegative(),
  cost: z.number().nonnegative(),
});

/**
 * By brand data item schema
 */
export const ByBrandItemSchema = z.object({
  brand: z.string(),
  tokens: z.number().int().nonnegative(),
  cost: z.number().nonnegative(),
});

/**
 * Tokens by model data item schema
 */
export const TokensByModelItemSchema = z.object({
  model: z.string(),
  tokens: z.number().int().nonnegative(),
});

/**
 * TPS by model data item schema
 */
export const TpsByModelItemSchema = z.object({
  model: z.string(),
  tps: z.number().nonnegative(),
});

/**
 * Usage heatmap data item schema
 */
export const UsageHeatmapItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    error: "Date must be in YYYY-MM-DD format",
  }),
  requests: z.number().int().nonnegative(),
});

/**
 * Complete dashboard response data schema
 */
export const DashboardDataSchema = z.object({
  summary: DashboardSummarySchema,
  tokensTrend: z.array(TokensTrendItemSchema),
  costTrend: z.array(CostTrendItemSchema),
  requestsTrend: z.array(RequestsTrendItemSchema),
  byProvider: z.array(ByProviderItemSchema),
  byBrand: z.array(ByBrandItemSchema),
  tokensByModel: z.array(TokensByModelItemSchema),
  tpsByModel: z.array(TpsByModelItemSchema),
  usageHeatmap: z.array(UsageHeatmapItemSchema),
});

/**
 * API error response schema
 */
export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z
    .array(
      z.object({
        path: z.array(z.union([z.string(), z.number()])),
        message: z.string(),
      })
    )
    .optional(),
});

// ============================================
// Database Row Transform Schemas
// Used to transform database query results to standard format
// ============================================

/**
 * Database aggregate result transform - handles nullable numeric values
 */
export const DbNumberSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((val) => Number(val ?? 0));

/**
 * Database integer result transform
 */
export const DbIntSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((val) => Math.floor(Number(val ?? 0)));

/**
 * Tokens trend database row schema
 */
export const DbTokensTrendRowSchema = z.object({
  date: z.string(),
  prompt: DbIntSchema,
  completion: DbIntSchema,
});

/**
 * Cost trend database row schema
 */
export const DbCostTrendRowSchema = z.object({
  date: z.string(),
  cost: DbNumberSchema,
});

/**
 * Requests trend database row schema
 */
export const DbRequestsTrendRowSchema = z.object({
  date: z.string(),
  requests: DbIntSchema,
});

/**
 * By provider database row schema
 */
export const DbByProviderRowSchema = z.object({
  provider: z.string(),
  tokens: DbIntSchema,
  cost: DbNumberSchema,
});

/**
 * By model database row schema
 */
export const DbByModelRowSchema = z.object({
  model: z.string(),
  tokens: DbIntSchema,
  cost: DbNumberSchema,
});

/**
 * TPS database row schema
 */
export const DbTpsRowSchema = z.object({
  model: z.string(),
  completionTokens: DbIntSchema,
  totalLatency: DbNumberSchema,
});

/**
 * Heatmap database row schema
 */
export const DbHeatmapRowSchema = z.object({
  date: z.string(),
  requests: DbIntSchema,
});

/**
 * Summary statistics database row schema
 */
export const DbSummaryRowSchema = z.object({
  totalRequests: DbIntSchema,
  totalTokens: DbIntSchema,
  totalCost: DbNumberSchema,
  totalLatency: DbNumberSchema,
  avgLatency: DbNumberSchema,
  completionTokens: DbIntSchema,
});
