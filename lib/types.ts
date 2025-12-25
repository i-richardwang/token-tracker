import { z } from "zod";
import {
  DashboardSummarySchema,
  TokensTrendItemSchema,
  CostTrendItemSchema,
  RequestsTrendItemSchema,
  ByProviderItemSchema,
  ByBrandItemSchema,
  TokensByModelItemSchema,
  TpsByModelItemSchema,
  HeatmapItemSchema,
  HeatmapDataSchema,
  DashboardDataSchema,
  DashboardQuerySchema,
  TimeRangeEnum,
  ApiErrorSchema,
} from "./schemas/dashboard";

// ============================================
// Types inferred from Schemas (Single Source of Truth)
// ============================================

/** Time range preset type */
export type TimeRange = z.infer<typeof TimeRangeEnum>;

/** Dashboard API query parameters type */
export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;

/** Dashboard summary statistics type */
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

/** Tokens trend data item type */
export type TokensTrendItem = z.infer<typeof TokensTrendItemSchema>;

/** Cost trend data item type */
export type CostTrendItem = z.infer<typeof CostTrendItemSchema>;

/** Requests trend data item type */
export type RequestsTrendItem = z.infer<typeof RequestsTrendItemSchema>;

/** By provider data item type */
export type ByProviderItem = z.infer<typeof ByProviderItemSchema>;

/** By brand data item type */
export type ByBrandItem = z.infer<typeof ByBrandItemSchema>;

/** Tokens by model data item type */
export type TokensByModelItem = z.infer<typeof TokensByModelItemSchema>;

/** TPS by model data item type */
export type TpsByModelItem = z.infer<typeof TpsByModelItemSchema>;

/** Heatmap data item type */
export type HeatmapItem = z.infer<typeof HeatmapItemSchema>;

/** Heatmap data type (requests + tokens) */
export type HeatmapData = z.infer<typeof HeatmapDataSchema>;

/** Complete dashboard response data type */
export type DashboardData = z.infer<typeof DashboardDataSchema>;

/** API error response type */
export type ApiError = z.infer<typeof ApiErrorSchema>;

/** Date range value for dashboard filters */
export type DateRangeValue =
  | { type: "preset"; value: string }
  | { type: "custom"; from: Date; to: Date };
