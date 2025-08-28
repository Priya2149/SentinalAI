// Conservative blocklist; replace with HF model later if you want.
// Returns true if toxic terms detected.
const TERMS = ["idiot","stupid","hate","kill"]; // keep minimal for demo
export function isToxic(text:string){
  const r = text.toLowerCase();
  return TERMS.some(t => r.includes(t));
}
