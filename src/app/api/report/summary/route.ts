import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const total = await prisma.modelCall.count();
  const cost = await prisma.modelCall.aggregate({ _sum: { costUsd: true } });
  const hallucinations = await prisma.modelCall.count({ where: { hallucinated: true }});
  const avgLatency = await prisma.modelCall.aggregate({ _avg: { latencyMs: true }});
  const fail = await prisma.modelCall.count({ where: { status: { in:["FAIL","FLAGGED"] }}});

  const rate = total ? (hallucinations/total) : 0;

  return NextResponse.json({
    totalCalls: total,
    estimatedCostUsd: Number(cost._sum.costUsd ?? 0),
    avgLatencyMs: Math.round(avgLatency._avg.latencyMs ?? 0),
    hallucinationRate: rate,
    failures: fail,
    // cute touch per your doc: EU AI Act label (static)
    euAiActRisk: "Minimal risk (demo)", 
  });
}
