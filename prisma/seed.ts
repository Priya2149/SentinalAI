// prisma/seed.ts
import { PrismaClient, Prisma, CallStatus } from "@prisma/client";
const prisma = new PrismaClient();

const USERS = [
  { email: "alice@example.com", name: "Alice" },
  { email: "bob@example.com", name: "Bob" },
];

const PROMPTS = [
  { q: "What is the capital of France?", a: "Paris" },
  { q: "Summarize GDPR in 1 sentence.", a: "GDPR is the EU data protection regulation." },
  { q: "Company X revenue in 2024?", a: "Unknown; requires current financials." },
  { q: "Generate a haiku about clouds.", a: "Clouds drift softly by\n..." },
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // Clean slate (order matters due to FKs)
  await prisma.evalResult.deleteMany();
  await prisma.modelCall.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.$transaction(
    USERS.map((u) => prisma.user.create({ data: u }))
  );

  for (let i = 0; i < 120; i++) {
    const u = rand(createdUsers);
    const p = rand(PROMPTS);

    const latencyMs = 100 + Math.floor(Math.random() * 1200);
    const promptTokens = 20 + Math.floor(Math.random() * 80);
    const respTokens = 15 + Math.floor(Math.random() * 120);

    const isBad = i % 11 === 0;
    const response = isBad ? "Paris is the capital of Germany." : p.a;

    // ✅ Strongly-typed status (no 'any')
    const status: CallStatus =
      Math.random() < 0.08 ? CallStatus.FAIL : CallStatus.SUCCESS;

    // ✅ Decimal without 'any'
    const cost = (promptTokens + respTokens) * 0.000002;
    const costUsd: Prisma.Decimal = new Prisma.Decimal(cost.toFixed(6));

    await prisma.modelCall.create({
      data: {
        userId: u.id,
        provider: "local",
        model: "demo-1",
        prompt: p.q,
        response,
        latencyMs,
        promptTokens,
        respTokens,
        status,
        costUsd,
        hallucinated: isBad,
        toxic: false,
        route: "/api/logs",
        ip: "127.0.0.1",
      },
    });
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
