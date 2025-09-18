import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(parseInt(searchParams.get("take") ?? "50", 10), 200);
  const skip = parseInt(searchParams.get("skip") ?? "0", 10);

  const rows = await prisma.modelCall.findMany({
    skip, take,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return NextResponse.json(rows);
}
