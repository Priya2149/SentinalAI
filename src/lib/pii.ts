import { PII_REGEX, SECRET_REGEX } from "./rules";

export function hasPII(text: string): { pii: boolean; secret: boolean; hits: string[] } {
  const hits: string[] = [];
  let pii = false, secret = false;

  for (const rx of PII_REGEX) if (rx.test(text)) { pii = true; hits.push(rx.source); }
  for (const rx of SECRET_REGEX) if (rx.test(text)) { secret = true; hits.push(rx.source); }

  return { pii, secret, hits };
}
