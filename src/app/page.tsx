import { prisma } from "@/lib/db";

export default async function Page() {
  const [counts, latest] = await Promise.all([
     prisma.modelCall.groupBy({
    by: ["status"],
    _count: { status: true },
  }),
  prisma.modelCall.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  }),
  ]);
type StatusCount = { status: string; _count: { status: number } };
 const total = (counts as StatusCount[]).reduce((a, c) => a + c._count.status, 0);
const ok = (counts as StatusCount[]).find(c => c.status === "SUCCESS")?._count.status ?? 0;
const fail = (counts as StatusCount[]).find(c => c.status === "FAIL")?._count.status ?? 0;
const flagged = (counts as StatusCount[]).find(c => c.status === "FLAGGED")?._count.status ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Overview</h1>
      <section className="grid sm:grid-cols-3 gap-3">
        <Kpi label="Total Calls" value={total} />
        <Kpi label="Success" value={ok} />
        <Kpi label="Failures" value={fail} />
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Latest Calls</h2>
        <div className="overflow-auto rounded-md border">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <Th>User</Th><Th>Model</Th><Th>Latency</Th><Th>Tokens</Th><Th>Status</Th><Th>At</Th>
              </tr>
            </thead>
            <tbody>
              {latest.map(row => (
                <tr key={row.id} className="border-t">
                  <Td>{row.user?.email ?? "—"}</Td>
                  <Td>{row.model}</Td>
                  <Td>{row.latencyMs} ms</Td>
                  <Td>{row.promptTokens + row.respTokens}</Td>
                  <Td><span className={row.status === "SUCCESS" ? "text-green-600" : "text-red-600"}>{row.status}</span></Td>
                  <Td>{row.createdAt.toLocaleString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) { return <th className="text-left px-3 py-2 font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="px-3 py-2">{children}</td>; }
