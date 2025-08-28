import { prisma } from "@/lib/prisma";
import KpiCards from "@/components/kpi-cards";

export default async function Home() {
  const [count, totals, flags] = await Promise.all([
    prisma.modelCall.count(),
    prisma.modelCall.groupBy({ by:["userId"], _sum:{ costUsd:true } }),
    prisma.modelCall.groupBy({ by:["status"], _count:{ _all:true } }),
  ]);
  const cost = Number(totals.reduce((a,c)=>a + Number(c._sum.costUsd ?? 0), 0)).toFixed(4);
  const errors = flags.find(f=>f.status==="FAIL")?._count._all ?? 0;

  return (
    <main className="space-y-8">
      <h1 className="text-2xl font-semibold">AI Governance Dashboard</h1>
      <KpiCards totalCalls={count} totalCost={cost} totalErrors={errors} />
      <div className="grid md:grid-cols-3 gap-4">
        <a href="/logs" className="underline">Logs</a>
        <a href="/metrics" className="underline">Metrics</a>
        <a href="/reports" className="underline">Reports (PDF)</a>
      </div>
    </main>
  );
}
