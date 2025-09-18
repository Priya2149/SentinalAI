import { TOXIC_WORDS } from "./rules";
export function isToxic(text: string) {
  const t = (text ?? "").toLowerCase();
  return TOXIC_WORDS.some(w => t.includes(w));
}
