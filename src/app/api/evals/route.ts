import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hallucinationScore } from "@/lib/evals";
import { isToxic } from "@/lib/toxicity";

export async function POST() {
  const calls = await prisma.modelCall.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  for (const c of calls) {
    // hallucination
    const h = hallucinationScore(c.prompt, c.response);
    if (h.score !== undefined) {
      await prisma.evalResult.create({ data: {
        callId: c.id, kind: "HALLUCINATION", passed: h.passed, score: h.score, details: "gold-compare"
      }});
      if (!h.passed) await prisma.modelCall.update({ where:{ id:c.id }, data:{ hallucinated:true }});
    }
    // toxicity
    const tox = isToxic(c.response);
    await prisma.evalResult.create({ data: {
      callId: c.id, kind: "TOXICITY", passed: !tox, score: tox ? 0 : 1, details: "wordlist"
    }});
    if (tox) await prisma.modelCall.update({ where:{ id:c.id }, data:{ toxic:true, status: "FLAGGED" }});
  }
  return NextResponse.json({ ok:true, evaluated: calls.length });
}
