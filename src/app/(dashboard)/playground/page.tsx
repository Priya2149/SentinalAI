"use client";

import { useState } from "react";

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
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-semibold">Playground</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Provider</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="border rounded px-2 py-1"
            >
              <option value="ollama">Ollama (local)</option>
              <option value="openrouter">OpenRouter (needs API key)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Model</span>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="border rounded px-2 py-1"
              placeholder="llama3.1"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className="border rounded px-3 py-2 disabled:opacity-50"
            >
              {loading ? "Running…" : "Send"}
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Prompt</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="border rounded px-2 py-2"
            placeholder="Ask me anything…"
          />
        </label>
      </form>

      {resp && (
        <div className="space-y-3">
          <h2 className="font-medium">Result</h2>

          {resp.ok ? (
            <>
              <div className="rounded border p-3 whitespace-pre-wrap">
                {resp.response}
              </div>
              <div className="rounded border p-3">
                <div className="text-sm text-muted-foreground mb-2">
                  Logged call
                </div>
                <div className="grid sm:grid-cols-2 gap-y-1 text-sm">
                  <div><b>ID:</b> {resp.call.id}</div>
                  <div><b>At:</b> {new Date(resp.call.createdAt).toLocaleString()}</div>
                  <div><b>Model:</b> {resp.call.model}</div>
                  <div><b>Latency:</b> {resp.call.latencyMs} ms</div>
                  <div><b>Tokens:</b> {resp.call.promptTokens + resp.call.respTokens}</div>
                  <div><b>Cost:</b> ${resp.call.costUsd.toFixed(6)}</div>
                  <div><b>Status:</b> {resp.call.status}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded border p-3 text-red-700">
              <div className="font-medium">Error</div>
              <div className="text-sm">{resp.error}</div>
              {resp.callId && (
                <div className="text-xs mt-1 opacity-80">
                  (Logged failed call: {resp.callId})
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
