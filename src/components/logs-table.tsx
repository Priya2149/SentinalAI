"use client";
import { Badge } from "@/components/ui/badge";

export type Log = {
  id: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  latencyMs: number;
  promptTokens: number;
  respTokens: number;
  status: "SUCCESS" | "FAIL" | "FLAGGED";
  hallucinated: boolean;
  toxic: boolean;
  costUsd: string | number | null; // serialized
  ts: string;                      // ISO string
  user?: { email: string | null } | null;
};

export default function LogsTable({ logs }: { logs: Log[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Model</th>
            <th className="p-2 text-left">Latency</th>
            <th className="p-2 text-left">Tokens</th>
            <th className="p-2 text-left">Cost</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Flags</th>
            <th className="p-2 text-left">Prompt → Response</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((r) => (
            <tr key={r.id} className="border-t align-top">
              <td className="p-2 whitespace-nowrap">
                {new Date(r.ts).toLocaleString()}
              </td>
              <td className="p-2">{r.user?.email ?? "—"}</td>
              <td className="p-2">{r.provider}/{r.model}</td>
              <td className="p-2">{r.latencyMs} ms</td>
              <td className="p-2">{r.promptTokens + r.respTokens}</td>
              <td className="p-2">
                ${Number(r.costUsd ?? 0).toFixed(6)}
              </td>
              <td className="p-2">
                <Badge variant={r.status === "SUCCESS" ? "default" : "destructive"}>
                  {r.status}
                </Badge>
              </td>
              <td className="p-2 space-x-1">
                {r.hallucinated && <Badge variant="destructive">hallucination</Badge>}
                {r.toxic && <Badge variant="destructive">toxic</Badge>}
              </td>
              <td className="p-2 max-w-[500px]">
                <div className="font-medium">Q: {r.prompt}</div>
                <div className="text-muted-foreground">A: {r.response}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
