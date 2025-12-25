import { z } from "zod";
import { db } from "@/lib/db";
import { logs } from "@/lib/db/schema";
import { normalizeModelName, getModelBrand } from "@/lib/model-mapping";
import {
  DashboardQuerySchema,
  DbTokensTrendRowSchema,
  DbCostTrendRowSchema,
  DbRequestsTrendRowSchema,
  DbByProviderRowSchema,
  DbByModelRowSchema,
  DbTpsRowSchema,
  DbHeatmapRowSchema,
  DbSummaryRowSchema,
} from "@/lib/schemas/dashboard";
import type { DashboardData, DashboardQuery } from "@/lib/types";
import { sql, gte, lte, eq, and, count, avg, sum } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ============================================
// Constants
// ============================================

const TIME_RANGES: Record<string, number> = {
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// ============================================
// Helper Functions
// ============================================

/**
 * Parse query parameters and calculate date range
 */
function getDateRange(query: DashboardQuery): {
  startDate: Date;
  endDate: Date | null;
} {
  if (query.from && query.to) {
    return { startDate: query.from, endDate: query.to };
  }

  const rangeValue = query.range || "7d";
  if (rangeValue === "all") {
    return { startDate: new Date(0), endDate: null };
  }

  const ms = TIME_RANGES[rangeValue] ?? TIME_RANGES["7d"];
  return { startDate: new Date(Date.now() - ms), endDate: null };
}

/**
 * Determine if the range is short (for deciding date grouping format)
 */
function isShortRange(query: DashboardQuery): boolean {
  if (query.from && query.to) {
    const diffMs = query.to.getTime() - query.from.getTime();
    return diffMs <= ONE_DAY_MS;
  }
  return query.range === "1d";
}

/**
 * Get date formatting SQL expression
 */
function getDateFormat(shortRange: boolean) {
  return shortRange
    ? sql<string>`to_char(${logs.timestamp}, 'HH24:00')`
    : sql<string>`to_char(${logs.timestamp}, 'MM-DD')`;
}

/**
 * Build date filter condition
 */
function getDateFilter(startDate: Date, endDate: Date | null) {
  if (endDate) {
    return and(gte(logs.timestamp, startDate), lte(logs.timestamp, endDate));
  }
  return gte(logs.timestamp, startDate);
}

/**
 * Format Zod validation error for API response
 */
function formatZodError(error: z.ZodError) {
  return {
    error: "Invalid request parameters",
    details: error.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    })),
  };
}

// ============================================
// Main Handler
// ============================================

export async function GET(request: NextRequest) {
  // 1. Extract and validate request parameters
  const searchParams = request.nextUrl.searchParams;
  const rawParams = {
    range: searchParams.get("range") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  };

  const parseResult = DashboardQuerySchema.safeParse(rawParams);
  if (!parseResult.success) {
    return NextResponse.json(formatZodError(parseResult.error), {
      status: 400,
    });
  }

  const query = parseResult.data;
  const { startDate, endDate } = getDateRange(query);
  const shortRange = isShortRange(query);
  const dateFormat = getDateFormat(shortRange);
  const dateFilter = getDateFilter(startDate, endDate);

  try {
    // 2. Execute database queries in parallel
    const [summaryResult, successCountResult] = await Promise.all([
      db
        .select({
          totalRequests: count(),
          totalTokens: sum(logs.totalTokens),
          totalCost: sum(logs.cost),
          totalLatency: sum(logs.latency),
          avgLatency: avg(logs.latency),
          completionTokens: sum(logs.completionTokens),
        })
        .from(logs)
        .where(dateFilter),
      db
        .select({ count: count() })
        .from(logs)
        .where(and(dateFilter, eq(logs.status, "success"))),
    ]);

    // 3. Transform summary data using Zod
    const summaryRow = DbSummaryRowSchema.parse(summaryResult[0] ?? {});
    const successCount = z
      .object({ count: z.coerce.number() })
      .parse(successCountResult[0] ?? { count: 0 }).count;

    const summary = {
      totalRequests: summaryRow.totalRequests,
      totalTokens: summaryRow.totalTokens,
      totalCost: summaryRow.totalCost,
      completionTokens: summaryRow.completionTokens,
      avgLatency: summaryRow.avgLatency,
      avgTps:
        summaryRow.totalLatency > 0
          ? (summaryRow.completionTokens / summaryRow.totalLatency) * 1000
          : 0,
      avgTokensPerRequest:
        summaryRow.totalRequests > 0
          ? summaryRow.totalTokens / summaryRow.totalRequests
          : 0,
      avgCostPerRequest:
        summaryRow.totalRequests > 0
          ? summaryRow.totalCost / summaryRow.totalRequests
          : 0,
      successRate:
        summaryRow.totalRequests > 0
          ? (successCount / summaryRow.totalRequests) * 100
          : 0,
    };

    // 4. Execute trend and classification queries in parallel
    const [
      tokensTrendRaw,
      costTrendRaw,
      requestsTrendRaw,
      byProviderRaw,
      byModelRaw,
      tpsByModelRaw,
      heatmapRaw,
    ] = await Promise.all([
      db
        .select({
          date: dateFormat,
          prompt: sum(logs.promptTokens),
          completion: sum(logs.completionTokens),
        })
        .from(logs)
        .where(dateFilter)
        .groupBy(dateFormat)
        .orderBy(dateFormat),
      db
        .select({
          date: dateFormat,
          cost: sum(logs.cost),
        })
        .from(logs)
        .where(dateFilter)
        .groupBy(dateFormat)
        .orderBy(dateFormat),
      db
        .select({
          date: dateFormat,
          requests: count(),
        })
        .from(logs)
        .where(dateFilter)
        .groupBy(dateFormat)
        .orderBy(dateFormat),
      db
        .select({
          provider: logs.provider,
          tokens: sum(logs.totalTokens),
          cost: sum(logs.cost),
        })
        .from(logs)
        .where(dateFilter)
        .groupBy(logs.provider),
      db
        .select({
          model: logs.model,
          tokens: sum(logs.totalTokens),
          cost: sum(logs.cost),
        })
        .from(logs)
        .where(dateFilter)
        .groupBy(logs.model),
      db
        .select({
          model: logs.model,
          completionTokens: sum(logs.completionTokens),
          totalLatency: sum(logs.latency),
        })
        .from(logs)
        .where(dateFilter)
        .groupBy(logs.model),
      db
        .select({
          date: sql<string>`to_char(${logs.timestamp}, 'YYYY-MM-DD')`,
          requests: count(),
          tokens: sum(logs.totalTokens),
        })
        .from(logs)
        .where(gte(logs.timestamp, new Date(Date.now() - ONE_YEAR_MS)))
        .groupBy(sql`to_char(${logs.timestamp}, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(${logs.timestamp}, 'YYYY-MM-DD')`),
    ]);

    // 5. Batch transform database results using Zod
    const tokensTrend = z.array(DbTokensTrendRowSchema).parse(tokensTrendRaw);
    const costTrend = z.array(DbCostTrendRowSchema).parse(costTrendRaw);
    const requestsTrend = z
      .array(DbRequestsTrendRowSchema)
      .parse(requestsTrendRaw);
    const byProvider = z.array(DbByProviderRowSchema).parse(byProviderRaw);
    const byModel = z.array(DbByModelRowSchema).parse(byModelRaw);
    const tpsByModelData = z.array(DbTpsRowSchema).parse(tpsByModelRaw);
    const heatmapData = z.array(DbHeatmapRowSchema).parse(heatmapRaw);

    const heatmap = {
      requests: heatmapData.map((d) => ({ date: d.date, value: d.requests })),
      tokens: heatmapData.map((d) => ({ date: d.date, value: d.tokens })),
    };

    // 6. Aggregate tokens by normalized model name
    const tokensByModelMap = new Map<string, number>();
    for (const item of byModel) {
      const model = normalizeModelName(item.model);
      const current = tokensByModelMap.get(model) ?? 0;
      tokensByModelMap.set(model, current + item.tokens);
    }
    const tokensByModel = Array.from(tokensByModelMap.entries())
      .map(([model, tokens]) => ({ model, tokens }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);

    // 7. Aggregate by brand
    const byBrandMap = new Map<string, { tokens: number; cost: number }>();
    for (const item of byModel) {
      const brand = getModelBrand(item.model);
      const current = byBrandMap.get(brand) ?? { tokens: 0, cost: 0 };
      current.tokens += item.tokens;
      current.cost += item.cost;
      byBrandMap.set(brand, current);
    }
    const byBrand = Array.from(byBrandMap.entries())
      .map(([brand, data]) => ({ brand, tokens: data.tokens, cost: data.cost }))
      .sort((a, b) => b.tokens - a.tokens);

    // 8. Aggregate TPS data by normalized model name
    const tpsByModelMap = new Map<
      string,
      { completionTokens: number; totalLatency: number }
    >();
    for (const item of tpsByModelData) {
      const model = normalizeModelName(item.model);
      const current = tpsByModelMap.get(model) ?? {
        completionTokens: 0,
        totalLatency: 0,
      };
      current.completionTokens += item.completionTokens;
      current.totalLatency += item.totalLatency;
      tpsByModelMap.set(model, current);
    }
    const tpsByModel = Array.from(tpsByModelMap.entries())
      .map(([model, data]) => ({
        model,
        tps:
          data.totalLatency > 0
            ? (data.completionTokens / data.totalLatency) * 1000
            : 0,
      }))
      .sort((a, b) => b.tps - a.tps)
      .slice(0, 10);

    // 9. Build and return response
    const response: DashboardData = {
      summary,
      tokensTrend,
      costTrend,
      requestsTrend,
      byProvider,
      byBrand,
      tokensByModel,
      tpsByModel,
      heatmap,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard API Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Data format error",
          details: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
