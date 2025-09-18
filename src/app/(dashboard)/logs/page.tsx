import { prisma } from "@/lib/prisma";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString();
}

export default async function LogsPage() {
  const raw = await prisma.modelCall.findMany({
    orderBy: { createdAt: "desc" }, // was ts: "desc"
    take: 200,
    include: { user: true },        // removed stray ", {"
  });

  const rows = raw.map((r) => ({
    id: r.id,
    at: r.createdAt,
    user: r.user?.email ?? "—",
    model: r.model,
    latency: r.latencyMs ?? 0,
    tokens: (r.promptTokens ?? 0) + (r.respTokens ?? 0),
    cost: r.costUsd ?? 0,
    status: r.status,
  }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold">Logs</h1>
      <div className="overflow-auto rounded-md border">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <Th>Time</Th>
              <Th>User</Th>
              <Th>Model</Th>
              <Th>Latency (ms)</Th>
              <Th>Tokens</Th>
              <Th>Cost ($)</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <Td>{formatDate(r.at)}</Td>
                <Td>{r.user}</Td>
                <Td>{r.model}</Td>
                <Td>{r.latency}</Td>
                <Td>{r.tokens}</Td>
                <Td>{r.cost.toFixed(5)}</Td>
                <Td>
                  <span
                    className={
                      r.status === "SUCCESS"
                        ? "text-green-600"
                        : r.status === "FLAGGED"
                        ? "text-amber-600"
                        : "text-red-600"
                    }
                  >
                    {r.status}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
