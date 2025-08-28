// Tiny hallucination check: compare response to expected answer space with fuzzy containment
// Also returns a similarity score (0..1)
export type GoldItem = { prompt: string; expected: string[] };

const GOLD: GoldItem[] = [
  { prompt: "What is the capital of France?", expected: ["paris"] },
  { prompt: "Summarize GDPR in 1 sentence.", expected: ["data protection","european union","eu regulation"] },
];

function normalize(s:string){ return s.toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim(); }

export function hallucinationScore(prompt:string, response:string){
  const p = normalize(prompt), r = normalize(response);
  const gold = GOLD.find(g => p.includes(normalize(g.prompt).split(" ").slice(0,4).join(" ")));
  if(!gold) return { passed:true, score:1 };
  let hits = 0;
  for(const e of gold.expected) if(r.includes(e)) hits++;
  const score = hits / gold.expected.length;
  return { passed: score >= 0.5, score }; // simple threshold
}
