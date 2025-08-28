import { prisma } from "@/lib/prisma";
import LogsTable from "@/components/logs-table";

export default async function LogsPage() {
  const raw = await prisma.modelCall.findMany({
    orderBy: { ts: "desc" },
    take: 200,
    include: { user: true },
  });

  // ✅ Serialize Date/Decimal for client component
  const logs = raw.map((l) => ({
    id: l.id,
    provider: l.provider,
    model: l.model,
    prompt: l.prompt,
    response: l.response,
    latencyMs: l.latencyMs,
    promptTokens: l.promptTokens,
    respTokens: l.respTokens,
    status: l.status,                 // enum string
    hallucinated: l.hallucinated,
    toxic: l.toxic,
    costUsd: l.costUsd?.toString?.() ?? "0", // Decimal -> string
    ts: l.ts.toISOString(),           // Date -> ISO string
    user: l.user ? { email: l.user.email } : null,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Logs</h2>
      <LogsTable logs={logs} />
      <form action="/api/seed" method="post">
        <button className="underline mt-4">Seed Demo Data</button>
      </form>
      <form action="/api/evals" method="post">
        <button className="underline">Run Evals</button>
      </form>
    </div>
  );
}
