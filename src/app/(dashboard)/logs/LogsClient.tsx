// app/(dashboard)/logs/LogsClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, Download, Eye, MoreVertical, Search as SearchIcon } from "lucide-react";

export type RangeKey = "24h" | "3d" | "7d" | "all";
export type StatusKey = "SUCCESS" | "FAIL" | "FLAGGED";
export type LogRow = {
  id: string;
  at: Date | string;
  user: string;
  model: string;
  latency: number;
  tokens: number;
  cost: number;
  status: StatusKey | string;
  promptTokens: number;
  respTokens: number;
  input?: unknown;
  output?: unknown;
  meta?: unknown;
};

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
function formatRelativeTime(d: Date | string): string {
  const now = new Date();
  const date = new Date(d);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
function csvEscape(cell: string): string {
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

type ControlsDefaults = {
  q: string;
  statusList: StatusKey[];
  model: string;
  userEmail: string;
  minLatency?: number;
  maxLatency?: number;
  minCost?: number;
  maxCost?: number;
  range: RangeKey;
  auto: "on" | "off";
};

type Overrides = Partial<
  Record<
    | "q"
    | "status"
    | "model"
    | "user"
    | "minLatency"
    | "maxLatency"
    | "minCost"
    | "maxCost"
    | "range"
    | "auto",
    string | undefined
  >
>;

export default function LogsClient({
  initialRows,
  lastUpdated,
  defaults,
}: {
  initialRows: LogRow[];
  lastUpdated: Date | string;
  defaults: ControlsDefaults;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState<string>(defaults.q);
  const [status, setStatus] = useState<StatusKey[]>(defaults.statusList);
  const [model, setModel] = useState<string>(defaults.model);
  const [userEmail, setUserEmail] = useState<string>(defaults.userEmail);
  const [minLatency, setMinLatency] = useState<string>(defaults.minLatency?.toString() ?? "");
  const [maxLatency, setMaxLatency] = useState<string>(defaults.maxLatency?.toString() ?? "");
  const [minCost, setMinCost] = useState<string>(defaults.minCost?.toString() ?? "");
  const [maxCost, setMaxCost] = useState<string>(defaults.maxCost?.toString() ?? "");
  const [range, setRange] = useState<RangeKey>(defaults.range);
  const [auto, setAuto] = useState<"on" | "off">(defaults.auto);

  const onExport = useCallback((): void => {
    const header = [
      "id",
      "createdAt",
      "user",
      "model",
      "latencyMs",
      "promptTokens",
      "respTokens",
      "tokens",
      "costUsd",
      "status",
    ];
    const lines: string[] = [header.join(",")];
    initialRows.forEach((r) => {
      const row = [
        r.id,
        new Date(r.at).toISOString(),
        r.user,
        r.model,
        String(r.latency),
        String(r.promptTokens),
        String(r.respTokens),
        String(r.tokens),
        String(r.cost),
        r.status as string,
      ];
      lines.push(row.map(csvEscape).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.download = `sentinel-logs-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [initialRows]);

  const apply = useCallback(
    (overrides?: Overrides): void => {
      const next = new URLSearchParams(params?.toString() ?? "");
      const setOrDel = (k: string, v?: string) => {
        if (v && v.trim() !== "") next.set(k, v);
        else next.delete(k);
      };
      setOrDel("q", overrides?.q ?? q);
      setOrDel("status", overrides?.status ?? (status.length ? status.join(",") : undefined));
      setOrDel("model", overrides?.model ?? model);
      setOrDel("user", overrides?.user ?? userEmail);
      setOrDel("minLatency", overrides?.minLatency ?? minLatency);
      setOrDel("maxLatency", overrides?.maxLatency ?? maxLatency);
      setOrDel("minCost", overrides?.minCost ?? minCost);
      setOrDel("maxCost", overrides?.maxCost ?? maxCost);
      setOrDel("range", overrides?.range ?? range);
      setOrDel("auto", overrides?.auto ?? auto);
      next.set("ts", Date.now().toString());
      router.replace(`${pathname}?${next.toString()}`);
    },
    [params, q, status, model, userEmail, minLatency, maxLatency, minCost, maxCost, range, auto, pathname, router]
  );

  useEffect(() => {
    if (auto !== "on") return;
    const id = window.setInterval(() => {
      apply({});
    }, 8000);
    return () => window.clearInterval(id);
  }, [auto, apply]);

  const models: string[] = useMemo(() => {
    const s = new Set<string>();
    initialRows.forEach((r) => s.add(r.model));
    return Array.from(s).sort();
  }, [initialRows]);

  const toggleStatus = (name: StatusKey): void =>
    setStatus((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));

  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white/70 dark:bg-gray-900/60">
        <SearchIcon className="h-4 w-4 text-gray-400" />
        <input
          className="bg-transparent outline-none text-sm w-48"
          placeholder="Search id, model, user…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
      </div>

      {/* Filters */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(["SUCCESS", "FAIL", "FLAGGED"] as StatusKey[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className={`px-2.5 py-1 rounded-full text-xs border ${
                        status.includes(s) ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Model</label>
                <select
                  className="mt-1 w-full px-2.5 py-1.5 rounded-lg border bg-background"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="">All</option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">User (email)</label>
                <input
                  className="mt-1 w-full px-2.5 py-1.5 rounded-lg border bg-background"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="contains…"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Time range</label>
                <select
                  className="mt-1 w-full px-2.5 py-1.5 rounded-lg border bg-background"
                  value={range}
                  onChange={(e) => setRange(e.target.value as RangeKey)}
                >
                  <option value="24h">Last 24h</option>
                  <option value="3d">Last 3 days</option>
                  <option value="7d">Last 7 days</option>
                  <option value="all">All time</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Latency (ms)</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    className="w-full px-2 py-1.5 rounded-lg border bg-background"
                    placeholder="min"
                    inputMode="numeric"
                    value={minLatency}
                    onChange={(e) => setMinLatency(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    className="w-full px-2 py-1.5 rounded-lg border bg-background"
                    placeholder="max"
                    inputMode="numeric"
                    value={maxLatency}
                    onChange={(e) => setMaxLatency(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Cost (USD)</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    className="w-full px-2 py-1.5 rounded-lg border bg-background"
                    placeholder="min"
                    inputMode="decimal"
                    value={minCost}
                    onChange={(e) => setMinCost(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    className="w-full px-2 py-1.5 rounded-lg border bg-background"
                    placeholder="max"
                    inputMode="decimal"
                    value={maxCost}
                    onChange={(e) => setMaxCost(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Switch checked={auto === "on"} onCheckedChange={(v: boolean) => setAuto(v ? "on" : "off")} />
                <span className="text-sm">Auto-refresh</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => {
                    setQ("");
                    setStatus([]);
                    setModel("");
                    setUserEmail("");
                    setMinLatency("");
                    setMaxLatency("");
                    setMinCost("");
                    setMaxCost("");
                    setRange("24h");
                  }}
                >
                  Clear
                </button>
                <button className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => apply()}>
                  Apply
                </button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">Last updated: {formatRelativeTime(lastUpdated)}</div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Export */}
      <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={onExport}>
        <Download className="h-4 w-4" />
        <span>Export</span>
      </button>
    </div>
  );
}

export function RowActions({ row }: { row: LogRow }) {
  const [open, setOpen] = useState<boolean>(false);
  const [menu, setMenu] = useState<boolean>(false);

  const copy = async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
  };

  const csvLine = useMemo<string>(() => {
    const data: ReadonlyArray<string> = [
      row.id,
      new Date(row.at).toISOString(),
      row.user,
      row.model,
      String(row.latency),
      String(row.promptTokens),
      String(row.respTokens),
      String(row.tokens),
      String(row.cost),
      row.status as string,
    ];
    return data.map(csvEscape).join(",");
  }, [row]);

  return (
    <div className="relative">
      {/* Eye opens details drawer */}
      <button
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        onClick={() => setOpen(true)}
        aria-label="View details"
      >
        <Eye className="h-4 w-4" />
      </button>

      {/* 3-dots menu */}
      <button
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        onClick={() => setMenu((m) => !m)}
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {menu && (
        <div
          className="absolute right-0 z-10 mt-2 w-44 rounded-md border bg-popover p-1 shadow-lg"
          onMouseLeave={() => setMenu(false)}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent"
            onClick={() => {
              copy(row.id);
              setMenu(false);
            }}
          >
            Copy ID
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent"
            onClick={() => {
              copy(JSON.stringify(row, null, 2));
              setMenu(false);
            }}
          >
            Copy as JSON
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent"
            onClick={() => {
              copy(csvLine);
              setMenu(false);
            }}
          >
            Copy as CSV row
          </button>
        </div>
      )}

      {/* Details Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" />
          <div
            className="w-[min(90vw,640px)] h-full bg-white dark:bg-gray-900 border-l p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Call Details</h3>
              <button className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <InfoRow label="ID" value={<code>{row.id}</code>} />
              <InfoRow label="Time" value={formatDate(row.at)} />
              <InfoRow label="User" value={row.user} />
              <InfoRow label="Model" value={row.model} />
              <InfoRow label="Latency" value={`${row.latency} ms`} />
              <InfoRow label="Tokens" value={`${row.tokens} (prompt ${row.promptTokens} / response ${row.respTokens})`} />
              <InfoRow label="Cost" value={`$${row.cost.toFixed(6)}`} />
              <InfoRow label="Status" value={row.status as string} />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-1">Input</h4>
                <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border overflow-auto max-h-56">
                  {row.input !== undefined ? JSON.stringify(row.input, null, 2) : "—"}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Output</h4>
                <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border overflow-auto max-h-56">
                  {row.output !== undefined ? JSON.stringify(row.output, null, 2) : "—"}
                </pre>
              </div>
              {row.meta !== undefined && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Meta</h4>
                  <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border overflow-auto max-h-56">
                    {JSON.stringify(row.meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="col-span-2 break-words">{value}</div>
    </div>
  );
}
