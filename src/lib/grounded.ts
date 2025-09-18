import { prisma } from "@/lib/prisma";

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
const EMBED_MODEL = "nomic-embed-text";

async function embed(text: string): Promise<number[]> {
  const r = await fetch(`${OLLAMA_BASE}/api/embeddings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });
  if (!r.ok) throw new Error(`Embeddings error ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.embeddings?.[0] ?? j.embedding ?? [];
}

export async function groundedCheck(answer: string, k = 5) {
  const vec = await embed(answer);
  const vectorLiteral = `[${vec.join(",")}]`;

  // smaller distance is more similar; ORDER BY ASC
  const rows = await prisma.$queryRawUnsafe<
    Array<{ id: string; title: string; content: string }>
  >(
    `select id, title, content
     from "KnowledgeChunk"
     order by embedding <=> $1::vector
     limit ${k};`,
    vectorLiteral
  );

  const text = (answer || "").toLowerCase();
  const supported = rows.some((r) => {
    const c = r.content.toLowerCase();
    const common = text.split(/\W+/).filter((w) => w.length > 4 && c.includes(w));
    return common.length >= 3;
  });

  return { supported, evidence: rows };
}
