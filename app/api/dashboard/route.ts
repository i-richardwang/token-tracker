import { db } from "@/lib/db";
import { logs } from "@/lib/db/schema";
import { sql, gte, eq, and, count, avg, sum, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TIME_RANGES: Record<string, number> = {
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function getStartDate(range: string): Date {
  if (range === "all") return new Date(0);
  const ms = TIME_RANGES[range] ?? TIME_RANGES["7d"];
  return new Date(Date.now() - ms);
}

function getDateFormat(isShortRange: boolean) {
  return isShortRange
    ? sql<string>`to_char(${logs.timestamp}, 'HH24:00')`
    : sql<string>`to_char(${logs.timestamp}, 'MM-DD')`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get("range") || "7d";
  const startDate = getStartDate(range);
  const isShortRange = range === "1d";
  const dateFormat = getDateFormat(isShortRange);

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
        .where(gte(logs.timestamp, startDate)),
      db
        .select({ count: count() })
        .from(logs)
        .where(and(gte(logs.timestamp, startDate), eq(logs.status, "success"))),
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

    const [tokensTrend, costTrend, requestsTrend, byProvider, requestsByModel, tpsByModelRaw] =
      await Promise.all([
        db
          .select({
            date: dateFormat,
            prompt: sum(logs.promptTokens),
            completion: sum(logs.completionTokens),
          })
          .from(logs)
          .where(gte(logs.timestamp, startDate))
          .groupBy(dateFormat)
          .orderBy(dateFormat),
        db
          .select({
            date: dateFormat,
            cost: sum(logs.cost),
          })
          .from(logs)
          .where(gte(logs.timestamp, startDate))
          .groupBy(dateFormat)
          .orderBy(dateFormat),
        db
          .select({
            date: dateFormat,
            requests: count(),
          })
          .from(logs)
          .where(gte(logs.timestamp, startDate))
          .groupBy(dateFormat)
          .orderBy(dateFormat),
        db
          .select({
            provider: logs.provider,
            tokens: sum(logs.totalTokens),
            cost: sum(logs.cost),
          })
          .from(logs)
          .where(gte(logs.timestamp, startDate))
          .groupBy(logs.provider),
        db
          .select({
            model: logs.model,
            requests: count(),
          })
          .from(logs)
          .where(gte(logs.timestamp, startDate))
          .groupBy(logs.model)
          .orderBy(desc(count()))
          .limit(8),
        db
          .select({
            model: logs.model,
            completionTokens: sum(logs.completionTokens),
            totalLatency: sum(logs.latency),
          })
          .from(logs)
          .where(gte(logs.timestamp, startDate))
          .groupBy(logs.model),
      ]);

    const tpsByModel = tpsByModelRaw
      .map((m) => {
        const completionTokens = Number(m.completionTokens ?? 0);
        const totalLatencyMs = Number(m.totalLatency ?? 0);
        const tps = totalLatencyMs > 0 ? (completionTokens / totalLatencyMs) * 1000 : 0;
        return { model: m.model, tps };
      })
      .sort((a, b) => b.tps - a.tps)
      .slice(0, 8);

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
      requestsByModel: requestsByModel.map((m) => ({
        model: m.model,
        requests: Number(m.requests),
      })),
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
