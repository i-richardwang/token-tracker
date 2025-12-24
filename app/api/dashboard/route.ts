import { db } from "@/lib/db";
import { logs } from "@/lib/db/schema";
import { normalizeModelName } from "@/lib/model-mapping";
import { sql, gte, lte, eq, and, count, avg, sum } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TIME_RANGES: Record<string, number> = {
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function getDateRange(
  range: string | null,
  fromParam: string | null,
  toParam: string | null
): { startDate: Date; endDate: Date | null } {
  if (fromParam && toParam) {
    return {
      startDate: new Date(fromParam),
      endDate: new Date(toParam),
    };
  }

  const rangeValue = range || "7d";
  if (rangeValue === "all") {
    return { startDate: new Date(0), endDate: null };
  }

  const ms = TIME_RANGES[rangeValue] ?? TIME_RANGES["7d"];
  return { startDate: new Date(Date.now() - ms), endDate: null };
}

function isShortRange(
  range: string | null,
  fromParam: string | null,
  toParam: string | null
): boolean {
  if (fromParam && toParam) {
    const from = new Date(fromParam);
    const to = new Date(toParam);
    const diffMs = to.getTime() - from.getTime();
    return diffMs <= 24 * 60 * 60 * 1000;
  }
  return range === "1d";
}

function getDateFormat(shortRange: boolean) {
  return shortRange
    ? sql<string>`to_char(${logs.timestamp}, 'HH24:00')`
    : sql<string>`to_char(${logs.timestamp}, 'MM-DD')`;
}

function getDateFilter(startDate: Date, endDate: Date | null) {
  if (endDate) {
    return and(gte(logs.timestamp, startDate), lte(logs.timestamp, endDate));
  }
  return gte(logs.timestamp, startDate);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get("range");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const { startDate, endDate } = getDateRange(range, fromParam, toParam);
  const shortRange = isShortRange(range, fromParam, toParam);
  const dateFormat = getDateFormat(shortRange);
  const dateFilter = getDateFilter(startDate, endDate);

  try {
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

    const totalRequests = Number(summaryResult[0]?.totalRequests ?? 0);
    const totalTokens = Number(summaryResult[0]?.totalTokens ?? 0);
    const totalCost = Number(summaryResult[0]?.totalCost ?? 0);
    const totalLatency = Number(summaryResult[0]?.totalLatency ?? 0);
    const completionTokens = Number(summaryResult[0]?.completionTokens ?? 0);
    const successCount = Number(successCountResult[0]?.count ?? 0);

    const summary = {
      totalRequests,
      totalTokens,
      totalCost,
      completionTokens,
      avgLatency: Number(summaryResult[0]?.avgLatency ?? 0),
      avgTps: totalLatency > 0 ? (completionTokens / totalLatency) * 1000 : 0,
      avgTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
      avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
      successRate: totalRequests > 0 ? (successCount / totalRequests) * 100 : 0,
    };

    const [tokensTrend, costTrend, requestsTrend, byProvider, tokensByModelRaw, tpsByModelRaw] =
      await Promise.all([
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
      ]);

    // Aggregate tokens by normalized model name
    const tokensByModelMap = new Map<string, number>();
    for (const item of tokensByModelRaw) {
      const model = normalizeModelName(item.model);
      const current = tokensByModelMap.get(model) ?? 0;
      tokensByModelMap.set(model, current + Number(item.tokens ?? 0));
    }
    const tokensByModel = Array.from(tokensByModelMap.entries())
      .map(([model, tokens]) => ({ model, tokens }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);

    // Aggregate TPS data by normalized model name
    const tpsByModelMap = new Map<string, { completionTokens: number; totalLatency: number }>();
    for (const item of tpsByModelRaw) {
      const model = normalizeModelName(item.model);
      const current = tpsByModelMap.get(model) ?? { completionTokens: 0, totalLatency: 0 };
      current.completionTokens += Number(item.completionTokens ?? 0);
      current.totalLatency += Number(item.totalLatency ?? 0);
      tpsByModelMap.set(model, current);
    }
    const tpsByModel = Array.from(tpsByModelMap.entries())
      .map(([model, data]) => ({
        model,
        tps: data.totalLatency > 0 ? (data.completionTokens / data.totalLatency) * 1000 : 0,
      }))
      .sort((a, b) => b.tps - a.tps)
      .slice(0, 10);

    return NextResponse.json({
      summary,
      tokensTrend: tokensTrend.map((t) => ({
        date: t.date,
        prompt: Number(t.prompt ?? 0),
        completion: Number(t.completion ?? 0),
      })),
      costTrend: costTrend.map((c) => ({
        date: c.date,
        cost: Number(c.cost ?? 0),
      })),
      requestsTrend: requestsTrend.map((r) => ({
        date: r.date,
        requests: Number(r.requests ?? 0),
      })),
      byProvider: byProvider.map((p) => ({
        provider: p.provider,
        tokens: Number(p.tokens ?? 0),
        cost: Number(p.cost ?? 0),
      })),
      tokensByModel,
      tpsByModel,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
