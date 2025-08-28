import { prisma } from "@/lib/prisma";
import CostChart from "@/components/charts/cost-chart";
import LatencyChart from "@/components/charts/latency-chart";
import ErrorChart from "@/components/charts/error-chart";

export default async function MetricsPage() {
  const calls = await prisma.modelCall.findMany({ orderBy: { ts: "asc" } });

  // aggregate in server comp (simple demo)
  const daily = new Map<string, {cost:number;latency:number[];errors:number}>();
  for (const c of calls) {
    const day = new Date(c.ts).toISOString().slice(0,10);
    if (!daily.has(day)) daily.set(day, { cost:0, latency:[], errors:0 });
    const row = daily.get(day)!;
    row.cost += Number(c.costUsd);
    row.latency.push(c.latencyMs);
    if (c.status !== "SUCCESS") row.errors++;
  }
  const labels = [...daily.keys()].sort();
  const cost = labels.map(d => daily.get(d)!.cost);
  const latency = labels.map(d => {
    const arr = daily.get(d)!.latency; 
    return Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
  });
  const errors = labels.map(d => daily.get(d)!.errors);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Metrics</h2>
      <CostChart labels={labels} data={cost}/>
      <LatencyChart labels={labels} data={latency}/>
      <ErrorChart labels={labels} data={errors}/>
    </div>
  );
}
