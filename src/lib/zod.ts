import { z } from "zod";

export const LogCreate = z.object({
  userId: z.string().optional(),
  provider: z.string(),
  model: z.string(),
  prompt: z.string().min(1),
  response: z.string().default(""),
  latencyMs: z.number().int().nonnegative(),
  promptTokens: z.number().int().nonnegative(),
  respTokens: z.number().int().nonnegative(),
  status: z.enum(["SUCCESS","FAIL","FLAGGED"]).default("SUCCESS"),
  route: z.string().optional(),
  ip: z.string().optional(),
});
