// simple 2025-style helper: inject model pricing table if you later add real providers
const DEFAULT_PER_TOKEN_USD = 0.000002; // $2 / 1M tokens (demo)
export function estimateCostUsd(promptTokens:number, respTokens:number) {
  return (promptTokens + respTokens) * DEFAULT_PER_TOKEN_USD;
}
