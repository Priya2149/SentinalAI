import { prisma } from "@/lib/prisma";

type ModelRow = {
  model: string;
  calls: number;
  avgLatencyMs: number;
  avgCostUsd: number;
  errorRate: number;
};

type UserRow = {
  user: string;
  calls: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  errorRate: number;
};

export default async function AnalyticsPage() {
  const [byModel, byUser]: [ModelRow[], UserRow[]] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/analytics/models`, {
      cache: "no-store",
    }).then((r) => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/analytics/users`, {
      cache: "no-store",
    }).then((r) => r.json()),
  ]);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-xl font-semibold">Analytics</h1>

      <section className="space-y-2">
        <h2 className="font-medium">By Model</h2>
        <div className="overflow-auto rounded-md border">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <Th>Model</Th>
                <Th>Calls</Th>
                <Th>Avg Latency</Th>
                <Th>Avg Cost ($)</Th>
                <Th>Error Rate</Th>
              </tr>
            </thead>
            <tbody>
              {byModel.map((r) => (
                <tr key={r.model} className="border-t">
                  <Td>{r.model}</Td>
                  <Td>{r.calls}</Td>
                  <Td>{r.avgLatencyMs} ms</Td>
                  <Td>{r.avgCostUsd.toFixed(5)}</Td>
                  <Td>{(r.errorRate * 100).toFixed(1)}%</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">By User</h2>
        <div className="overflow-auto rounded-md border">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <Th>User</Th>
                <Th>Calls</Th>
                <Th>Total Cost ($)</Th>
                <Th>Avg Latency</Th>
                <Th>Error Rate</Th>
              </tr>
            </thead>
            <tbody>
              {byUser.map((r, i) => (
                <tr key={i} className="border-t">
                  <Td>{r.user}</Td>
                  <Td>{r.calls}</Td>
                  <Td>{r.totalCostUsd.toFixed(5)}</Td>
                  <Td>{r.avgLatencyMs} ms</Td>
                  <Td>{(r.errorRate * 100).toFixed(1)}%</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
