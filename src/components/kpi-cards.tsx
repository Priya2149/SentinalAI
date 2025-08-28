"use client";
import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Props = {
  totalCalls: number;
  totalCost: number | string;
  totalErrors: number;
};

type KPI = { label: string; value: ReactNode };

export default function KpiCards({ totalCalls, totalCost, totalErrors }: Props) {
  const costNum = typeof totalCost === "string" ? Number(totalCost) : totalCost;

  const KPIS: KPI[] = [
    { label: "Total Calls", value: totalCalls.toLocaleString() },
    {
      label: "Est. Cost (USD)",
      value:
        typeof costNum === "number" && !Number.isNaN(costNum)
          ? `$${costNum.toFixed(4)}`
          : String(totalCost),
    },
    { label: "Errors", value: totalErrors.toLocaleString() },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {KPIS.map((k) => (
        <Card key={k.label}>
          <CardHeader>
            <CardTitle>{k.label}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl">{k.value}</CardContent>
        </Card>
      ))}
    </div>
  );
}
