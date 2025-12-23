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
          avgLatency: avg(logs.latency),
          promptTokens: sum(logs.promptTokens),
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
    const successCount = Number(successCountResult[0]?.count ?? 0);

    const summary = {
      totalRequests,
      totalTokens: Number(summaryResult[0]?.totalTokens ?? 0),
      totalCost: Number(summaryResult[0]?.totalCost ?? 0),
      avgLatency: Number(summaryResult[0]?.avgLatency ?? 0),
      promptTokens: Number(summaryResult[0]?.promptTokens ?? 0),
      completionTokens: Number(summaryResult[0]?.completionTokens ?? 0),
      successRate: totalRequests > 0 ? (successCount / totalRequests) * 100 : 0,
    };

    const [tokenTrend, costTrend, providerDistribution, modelDistribution, statusDistribution] =
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
            provider: logs.provider,
            count: count(),
            tokens: sum(logs.totalTokens),
          })
          .from(logs)
          .where(gte(logs.timestamp, startDate))
          .groupBy(logs.provider),
        db
          .select({
            model: logs.model,
            count: count(),
            tokens: sum(logs.totalTokens),
          })
          .from(logs)
          .where(gte(logs.timestamp, startDate))
          .groupBy(logs.model)
          .orderBy(desc(count()))
          .limit(8),
        db
          .select({
            status: logs.status,
            count: count(),
          })
          .from(logs)
          .where(gte(logs.timestamp, startDate))
          .groupBy(logs.status),
      ]);

    return NextResponse.json({
      summary,
      tokenTrend: tokenTrend.map((t) => ({
        date: t.date,
        prompt: Number(t.prompt ?? 0),
        completion: Number(t.completion ?? 0),
      })),
      costTrend: costTrend.map((c) => ({
        date: c.date,
        cost: Number(c.cost ?? 0),
      })),
      providerDistribution: providerDistribution.map((p) => ({
        provider: p.provider,
        count: Number(p.count),
        tokens: Number(p.tokens ?? 0),
      })),
      modelDistribution: modelDistribution.map((m) => ({
        model: m.model,
        count: Number(m.count),
        tokens: Number(m.tokens ?? 0),
      })),
      statusDistribution: statusDistribution.map((s) => ({
        status: s.status,
        count: Number(s.count),
      })),
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
