import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** You can add more models here if you like */
const DEFAULT_OLLAMA_MODEL = "llama3.1"; // make sure you've pulled it: `ollama pull llama3.1`

type Body = {
  provider?: "ollama" | "openrouter";
  model?: string;
  prompt: string;
  userId?: string;
};

function estimateTokens(text: string): number {
  // cheap + deterministic approx for demo
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words * 1.33);
}

const COSTS_PER_TOKEN: Record<string, number> = {
  // local models cost $0; set non-zero if you demo cloud providers
  [DEFAULT_OLLAMA_MODEL]: 0,
  "gpt-4o-mini": 0.000002,
};

export async function POST(req: Request) {
  const b = (await req.json()) as Body;
  const provider = b.provider ?? "ollama";
  const model = b.model ?? DEFAULT_OLLAMA_MODEL;
  const prompt = (b.prompt ?? "").trim();
  const userId = b.userId; // optional; leave undefined for anon demo

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const t0 = Date.now();
  let responseText = "";
  const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";

  try {
    if (provider === "ollama") {
      // requires local Ollama: `ollama serve`
      const r = await fetch(`${OLLAMA_BASE}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model, prompt, stream: false }),
      });
      if (!r.ok) {
        const msg = await r.text();
        throw new Error(`Ollama error ${r.status}: ${msg}`);
      }
      const j = await r.json();
      responseText = j.response ?? "";
    } else {
      // optional: OpenRouter (needs OPENROUTER_API_KEY set)
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!r.ok) {
        const msg = await r.text();
        throw new Error(`OpenRouter error ${r.status}: ${msg}`);
      }
      const j = await r.json();
      responseText = j.choices?.[0]?.message?.content ?? "";
    }
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : "Unknown error";
    // Log failed call too (useful for observability)
    const failed = await prisma.modelCall.create({
      data: {
        userId,
        model,
        prompt,
        response: `ERROR: ${errMsg}`,
        latencyMs: Date.now() - t0,
        promptTokens: estimateTokens(prompt),
        respTokens: 0,
        costUsd: 0,
        status: "FAIL",
      },
    });
    return NextResponse.json(
      { ok: false, error: errMsg, callId: failed.id },
      { status: 502 }
    );
  }

  const latencyMs = Date.now() - t0;
  const promptTokens = estimateTokens(prompt);
  const respTokens = estimateTokens(responseText);
  const costUsd =
    (COSTS_PER_TOKEN[model] ?? 0) * (promptTokens + respTokens);

  // Write success log
  const row = await prisma.modelCall.create({
    data: {
      userId,
      model,
      prompt,
      response: responseText,
      latencyMs,
      promptTokens,
      respTokens,
      costUsd,
      status: "SUCCESS",
    },
    select: {
      id: true,
      createdAt: true,
      model: true,
      latencyMs: true,
      promptTokens: true,
      respTokens: true,
      costUsd: true,
      status: true,
    },
  });

  return NextResponse.json({ ok: true, call: row, response: responseText });
}
