import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(+d) ? null : d;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = parseDate(url.searchParams.get("from"));
  const to   = parseDate(url.searchParams.get("to"));

  // default: last 14 days
  const end = to ?? new Date();
  const start = from ?? new Date(end.getTime() - 13 * 24 * 3600_000);

  const rows = await prisma.$queryRawUnsafe<Array<{
    day: Date; calls: bigint; avg_latency: number | null; cost: number | null; errors: bigint;
  }>>(
    `SELECT date_trunc('day', "createdAt") AS day,
            COUNT(*)                         AS calls,
            AVG("latencyMs")                 AS avg_latency,
            SUM("costUsd")                   AS cost,
            SUM(CASE WHEN status <> 'SUCCESS' THEN 1 ELSE 0 END) AS errors
     FROM "ModelCall"
     WHERE "createdAt" >= $1 AND "createdAt" < $2
     GROUP BY 1
     ORDER BY 1 ASC`,
    start, new Date(end.getTime() + 24*3600_000)
  );

  const data = rows.map(r => ({
    date: new Date(r.day).toISOString().slice(0,10),
    calls: Number(r.calls),
    avgLatencyMs: Math.round(r.avg_latency ?? 0),
    costUsd: +(r.cost ?? 0),
    errors: Number(r.errors),
    errorRate: Number(r.calls) ? Number(r.errors) / Number(r.calls) : 0,
  }));

  return NextResponse.json({ from: start.toISOString(), to: end.toISOString(), data });
}
