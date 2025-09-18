import { INJECTION_PATTERNS } from "./rules";

export function isPromptInjection(text: string): { matched: boolean; pattern?: string } {
  for (const rx of INJECTION_PATTERNS) {
    if (rx.test(text)) return { matched: true, pattern: rx.source };
  }
  return { matched: false };
}
