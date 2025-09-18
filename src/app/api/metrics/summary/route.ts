import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [count, latency, cost, hall, tox, byStatus] = await Promise.all([
    prisma.modelCall.count(),
    prisma.modelCall.aggregate({ _avg: { latencyMs: true } }),
    prisma.modelCall.aggregate({ _avg: { costUsd: true } }),
    prisma.modelCall.count({ where: { hallucinated: true } }),
    prisma.modelCall.count({ where: { toxic: true } }),
    prisma.modelCall.groupBy({
      by: ["status"],
      _count: { status: true }
    })
  ]);

  const statusCounts = Object.fromEntries(
    byStatus.map(s => [s.status, s._count.status])
  );

  return NextResponse.json({
    total: count,
    avg_latency_ms: Math.round(latency._avg.latencyMs ?? 0),
    avg_cost_usd: +(cost._avg.costUsd ?? 0),
    hallucination_rate: count ? hall / count : 0,
    toxicity_rate: count ? tox / count : 0,
    statuses: {
      SUCCESS: statusCounts["SUCCESS"] ?? 0,
      FAIL: statusCounts["FAIL"] ?? 0,
      FLAGGED: statusCounts["FLAGGED"] ?? 0,
    },
  });
}
