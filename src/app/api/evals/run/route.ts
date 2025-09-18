import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isToxic } from "@/lib/toxicity";
import { isPromptInjection } from "@/lib/injection";
import { hasPII } from "@/lib/pii";
import { groundedCheck } from "@/lib/grounded";

export async function POST() {
  const calls = await prisma.modelCall.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { id:true, prompt:true, response:true, status:true },
  });

  let evaluated = 0;

  for (const c of calls) {
    // 1) Prompt Injection (on prompt)
    const inj = isPromptInjection(c.prompt ?? "");
    await prisma.evalResult.upsert({
      where: { callId_kind: { callId: c.id, kind: "INJECTION" } },
      update: { passed: !inj.matched, score: inj.matched ? 0 : 1, details: inj.matched ? "pattern:"+inj.pattern : "ok" },
      create: { callId: c.id, kind: "INJECTION", passed: !inj.matched, score: inj.matched ? 0 : 1, details: inj.matched ? "pattern:"+inj.pattern : "ok" },
    });
    if (inj.matched && c.status === "SUCCESS") {
      await prisma.modelCall.update({ where: { id: c.id }, data: { status: "FLAGGED" } });
    }

    // 2) PII / Secrets (on response)
    const pii = hasPII(c.response ?? "");
    const piiFail = pii.pii || pii.secret;
    await prisma.evalResult.upsert({
      where: { callId_kind: { callId: c.id, kind: "PII" } },
      update: { passed: !piiFail, score: piiFail ? 0 : 1, details: pii.hits.join(",") || "ok" },
      create: { callId: c.id, kind: "PII", passed: !piiFail, score: piiFail ? 0 : 1, details: pii.hits.join(",") || "ok" },
    });
    if (piiFail && c.status === "SUCCESS") {
      await prisma.modelCall.update({ where: { id: c.id }, data: { status: "FLAGGED" } });
    }

    // 3) Toxicity (on response)
    const tox = isToxic(c.response ?? "");
    await prisma.evalResult.upsert({
      where: { callId_kind: { callId: c.id, kind: "TOXICITY" } },
      update: { passed: !tox, score: tox ? 0 : 1, details: "lexicon" },
      create: { callId: c.id, kind: "TOXICITY", passed: !tox, score: tox ? 0 : 1, details: "lexicon" },
    });
    if (tox && c.status === "SUCCESS") {
      await prisma.modelCall.update({ where: { id: c.id }, data: { status: "FLAGGED" } });
    }

    // 4) Grounded factuality (on response)
    const g = await groundedCheck(c.response ?? "");
    await prisma.evalResult.upsert({
      where: { callId_kind: { callId: c.id, kind: "GROUNDING" } },
      update: { passed: g.supported, score: g.supported ? 1 : 0, details: g.evidence.map(e => e.id).join(",") },
      create: { callId: c.id, kind: "GROUNDING", passed: g.supported, score: g.supported ? 1 : 0, details: g.evidence.map(e => e.id).join(",") },
    });
    if (!g.supported && c.status === "SUCCESS") {
      await prisma.modelCall.update({ where: { id: c.id }, data: { status: "FLAGGED" } });
    }

    evaluated++;
  }

  return NextResponse.json({ ok: true, evaluated });
}
