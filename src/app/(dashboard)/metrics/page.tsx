import { prisma } from "@/lib/prisma";

// tiny helper to format the date (no 'any')
function ymd(d: Date | string) {
  const dd = new Date(d);
  return dd.getFullYear() + "-" + String(dd.getMonth() + 1).padStart(2, "0") + "-" + String(dd.getDate()).padStart(2, "0");
}

export default async function MetricsPage() {
  // use createdAt, not ts
  const calls = await prisma.modelCall.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
      latencyMs: true,
      costUsd: true,
      status: true,
    },
  });

  // aggregate by day
  const daily = new Map<string, { cost: number; latencies: number[]; errors: number }>();
  for (const c of calls) {
    const key = ymd(c.createdAt);
    if (!daily.has(key)) daily.set(key, { cost: 0, latencies: [], errors: 0 });
    const d = daily.get(key)!;
    d.cost += c.costUsd ?? 0;
    d.latencies.push(c.latencyMs ?? 0);
    if (c.status !== "SUCCESS") d.errors += 1;
  }

  const rows = Array.from(daily.entries()).map(([date, v]) => {
    const avgLatency = v.latencies.length
      ? Math.round(v.latencies.reduce((a, b) => a + b, 0) / v.latencies.length)
      : 0;
    return { date, cost: v.cost, avgLatency, errors: v.errors };
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold">Metrics</h1>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Total Days" value={rows.length} />
        <Stat label="Total Cost ($)" value={rows.reduce((a, r) => a + r.cost, 0).toFixed(4)} />
        <Stat
          label="Avg Daily Latency (ms)"
          value={
            rows.length
              ? Math.round(rows.reduce((a, r) => a + r.avgLatency, 0) / rows.length)
              : 0
          }
        />
      </div>

      <div className="overflow-auto rounded-md border">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <Th>Date</Th>
              <Th>Total Cost ($)</Th>
              <Th>Avg Latency (ms)</Th>
              <Th>Errors</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} className="border-t">
                <Td>{r.date}</Td>
                <Td>{r.cost.toFixed(4)}</Td>
                <Td>{r.avgLatency}</Td>
                <Td>{r.errors}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
