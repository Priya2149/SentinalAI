import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LogCreate } from "@/lib/zod";
import { estimateCostUsd } from "@/lib/cost";

export async function GET() {
  const logs = await prisma.modelCall.findMany({ orderBy: { ts: "desc" }, take: 200 });
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = LogCreate.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { promptTokens, respTokens } = parsed.data;
  const costUsd = estimateCostUsd(promptTokens, respTokens);

  const created = await prisma.modelCall.create({
    data: { ...parsed.data, costUsd }
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
