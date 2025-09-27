import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { z } from "zod";
// import { runEvaluations } from "@/lib/evaluations"; // if you have this

// --- Helpers ---
function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

const openai = new OpenAI({
  apiKey: requiredEnv("OPENAI_API_KEY"),
});

// Strict schema for the request body
const BodySchema = z.object({
  userId: z.string().min(1).default("anonymous"),
  model: z.string().min(1).default("gpt-4o-mini"),
  prompt: z.string().default(""),
});

type Body = z.infer<typeof BodySchema>;

// Example: POST /api/chat with body { userId, model, prompt }
export async function POST(req: Request) {
  try {
    // Parse JSON safely → unknown → validate with Zod (no `any`)
    const raw: unknown = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { userId, model: modelUsed, prompt }: Body = parsed.data;

    // --- Call your model here ---
    const start = Date.now();
    const chatResponse = await openai.chat.completions.create({
      model: modelUsed,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });
    const latencyMs = Date.now() - start;

    const responseText: string = chatResponse.choices[0]?.message?.content ?? "";
    const promptTokens: number = chatResponse.usage?.prompt_tokens ?? 0;
    const respTokens: number = chatResponse.usage?.completion_tokens ?? 0;
    const totalTokens: number = chatResponse.usage?.total_tokens ?? (promptTokens + respTokens);

    // Example cost calculation (adjust to your model pricing)
    const costUsd: number =
      (promptTokens / 1000) * 0.0005 + (respTokens / 1000) * 0.0015;

    // Save to DB with explicit mappings
    const row = await prisma.modelCall.create({
      data: {
        userId: userId,
        model: modelUsed,
        prompt: prompt,
        response: responseText,
        latencyMs: latencyMs,
        promptTokens: promptTokens,
        respTokens: respTokens,
        costUsd: costUsd,
        status: "SUCCESS",
      },
    });

    // Optionally kick off async evals
    // void runEvaluations(row.id, prompt, responseText);

    return NextResponse.json({
      ok: true,
      call: row,
      response: responseText,
      tokens: {
        prompt: promptTokens,
        response: respTokens,
        total: totalTokens,
      },
      costUsd,
      latencyMs,
    });
  } catch (err: unknown) {
    // Narrow unknown -> string message
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
