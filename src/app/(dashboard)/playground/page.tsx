"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Rocket,
  TerminalSquare,
  Cpu,
  KeySquare,
  Loader2,
  CheckCircle2,
  XCircle,
  FlagTriangleRight,
  Clock,
  Coins,
  Gauge,
  Copy,
} from "lucide-react";

type Provider = "ollama" | "openrouter";

type ApiResponse =
  | {
      ok: true;
      response: string;
      call: {
        id: string;
        createdAt: string;
        model: string;
        latencyMs: number;
        promptTokens: number;
        respTokens: number;
        costUsd: number;
        status: "SUCCESS" | "FAIL" | "FLAGGED";
      };
    }
  | {
      ok: false;
      error: string;
      callId?: string;
    };

export default function PlaygroundPage() {
  const [provider, setProvider] = useState<Provider>("ollama");
  const [model, setModel] = useState<string>("llama3.1");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resp, setResp] = useState<ApiResponse | null>(null);

  const canSubmit = !loading && prompt.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setResp(null);
    try {
      const r = await fetch("/api/llm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, model, prompt }),
      });
      const j: ApiResponse = await r.json();
      setResp(j);
    } catch {
      setResp({ ok: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-0 md:p-6 space-y-6">
      {/* Hero (matches Analytics gradient/glass style) */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none [background:radial-gradient(60%_50%_at_10%_10%,white,transparent_60%),radial-gradient(40%_40%_at_90%_20%,white,transparent_60%)]" />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Playground
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Prompt & test models
            </h1>
            <p className="mt-1 text-sm sm:text-base text-white/85">
              Send test prompts, inspect responses, and log every call for analytics.
            </p>
          </div>

          {/* Tiny legend card */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur px-3 py-2">
            <TerminalSquare className="h-4 w-4" />
            <span className="text-sm">Logs stream to Analytics</span>
          </div>
        </div>
      </div>

      {/* Form + Response layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur p-5 shadow-sm space-y-5"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Provider */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <KeySquare className="h-4 w-4" />
                Provider
              </span>
              <div className="relative">
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as Provider)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ollama">Ollama (local)</option>
                  <option value="openrouter">OpenRouter (needs API key)</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
              </div>
            </label>

            {/* Model */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Model
              </span>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="llama3.1"
              />
            </label>

            {/* Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running…
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prompt */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Prompt</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ask me anything…"
            />
          </label>

          {/* Helper tips row */}
          <div className="grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <span className="rounded-lg border border-dashed px-3 py-2">
              • Use <b>Ollama</b> for local quick checks.
            </span>
            <span className="rounded-lg border border-dashed px-3 py-2">
              • Use <b>OpenRouter</b> for hosted frontier models.
            </span>
            <span className="rounded-lg border border-dashed px-3 py-2">
              • Every call is logged to the dashboard.
            </span>
          </div>
        </form>

        {/* Right: Result */}
        <div className="space-y-5">
          {/* Response card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-indigo-600" />
                <h2 className="text-base font-semibold">Result</h2>
              </div>

              {/* Status badge (only when we have a response) */}
              {resp && (
                resp.ok ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Success
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 px-2.5 py-1 text-xs font-semibold">
                    <XCircle className="h-3.5 w-3.5" />
                    Error
                  </span>
                )
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Body */}
              {resp ? (
                resp.ok ? (
                  <ResponseBlock text={resp.response} />
                ) : (
                  <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-900/20 p-3 text-rose-700 dark:text-rose-300">
                    <div className="font-medium">Error</div>
                    <div className="text-sm">{resp.error}</div>
                    {resp.callId && (
                      <div className="text-xs mt-1 opacity-80">
                        (Logged failed call: {resp.callId})
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-sm text-muted-foreground">
                  No response yet — run a prompt to see output and call metadata here.
                </div>
              )}
            </div>
          </div>

          {/* Call metadata */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-indigo-600" />
              <h3 className="text-base font-semibold">Logged call</h3>
            </div>
            <div className="p-5">
              {resp && resp.ok ? (
                <div className="grid sm:grid-cols-2 gap-y-2 text-sm">
                  <Meta label="ID" value={resp.call.id} />
                  <Meta
                    label="At"
                    value={new Date(resp.call.createdAt).toLocaleString()}
                  />
                  <Meta label="Model" value={resp.call.model} icon={<Cpu className="h-3.5 w-3.5" />} />
                  <Meta
                    label="Latency"
                    value={`${resp.call.latencyMs} ms`}
                    icon={<Clock className="h-3.5 w-3.5" />}
                  />
                  <Meta
                    label="Tokens"
                    value={`${resp.call.promptTokens + resp.call.respTokens}`}
                  />
                  <Meta
                    label="Cost"
                    value={`$${resp.call.costUsd.toFixed(6)}`}
                    icon={<Coins className="h-3.5 w-3.5" />}
                  />
                  <StatusMeta status={resp.call.status} />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Nothing logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Small UI helpers (local-only) -------------------- */

function ResponseBlock({ text }: { text: string }) {
  const copyable = useMemo(() => text ?? "", [text]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyable);
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="relative">
      <pre className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 p-3 text-sm whitespace-pre-wrap">
        {text}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
        aria-label="Copy response"
        title="Copy"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy
      </button>
    </div>
  );
}

function Meta({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <div className="text-muted-foreground">{label}:</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}

function StatusMeta({ status }: { status: "SUCCESS" | "FAIL" | "FLAGGED" }) {
  const map = {
    SUCCESS:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    FAIL: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
    FLAGGED:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  } as const;

  const Icon =
    status === "SUCCESS" ? CheckCircle2 : status === "FAIL" ? XCircle : FlagTriangleRight;

  return (
    <div className="flex items-center gap-2">
      <div className="text-muted-foreground">Status:</div>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {status}
      </span>
    </div>
  );
}
