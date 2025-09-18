/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";
import crypto from "node:crypto";

const prisma = new PrismaClient();
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
const EMBED_MODEL = "nomic-embed-text"; // 768 dims

function chunkText(text: string, chunkSize = 800, overlap = 120): string[] {
  const clean = text.replace(/\r/g, "").trim();
  const parts: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const slice = clean.slice(i, i + chunkSize);
    parts.push(slice);
    i += chunkSize - overlap;
  }
  return parts.map(s => s.trim()).filter(Boolean);
}

async function embed(text: string): Promise<number[]> {
  const r = await fetch(`${OLLAMA_BASE}/api/embeddings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });
  if (!r.ok) throw new Error(`Embeddings error ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const v: number[] = j.embeddings?.[0] ?? j.embedding ?? [];
  if (!Array.isArray(v) || v.length !== 768) {
    throw new Error(`Unexpected embedding length: ${v.length}`);
  }
  return v;
}

function readDocs(dir = "docs"): Array<{ title: string; content: string }> {
  const out: Array<{ title: string; content: string }> = [];
  if (!fs.existsSync(dir)) {
    out.push({
      title: "EU AI Act Summary",
      content:
        "The EU AI Act categorizes AI systems by risk and introduces obligations for providers and deployers. High-risk systems require risk management, data governance, and human oversight.",
    });
    out.push({
      title: "Security Policy",
      content:
        "Do not process secrets in prompts. Mask PII. Only approved models are permitted. All usage is logged and monitored for safety and compliance.",
    });
    return out;
  }
  const files = fs.readdirSync(dir).filter(f => /\.(md|txt)$/i.test(f));
  for (const f of files) {
    const p = path.join(dir, f);
    const content = fs.readFileSync(p, "utf8");
    out.push({ title: path.basename(f), content });
  }
  return out;
}

async function main() {
  const docs = readDocs();
  let created = 0;

  for (const d of docs) {
    const chunks = chunkText(d.content);
    for (const c of chunks) {
      const v = await embed(c);
      const id = crypto.randomUUID();
      const vectorLiteral = `[${v.join(",")}]`; // pgvector literal

      await prisma.$executeRawUnsafe(
        `insert into "KnowledgeChunk"(id, "createdAt", title, content, embedding)
         values ($1, now(), $2, $3, $4::vector)`,
        id, d.title, c, vectorLiteral
      );

      created++;
      if (created % 10 === 0) console.log(`Inserted ${created} chunks...`);
    }
  }
  console.log(`Done. Inserted ${created} chunks.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });