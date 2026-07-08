import { DAILY_BUDGET_USD, INPUT_COST, OUTPUT_COST } from './env';
import { callerKey, incrBy, utcDay } from './counters';

const DAY_TTL = 26 * 60 * 60; // day counters live a bit past the UTC day

export interface GuardResult {
  ok: boolean;
  status?: number;
  code?: string;
  message?: string;
  remaining?: number;
}

const blocked = (status: number, code: string, message: string): GuardResult => ({
  ok: false,
  status,
  code,
  message,
});

/** Per-IP rate cap across both endpoints: 30 requests/hour. */
export async function checkRate(req: Request): Promise<GuardResult> {
  const hour = new Date().toISOString().slice(0, 13);
  const n = await incrBy(`rate:${hour}:${callerKey(req)}`, 1, 60 * 60);
  if (n > 30) return blocked(429, 'rate_limited', 'Too many requests — take a breath and try again in a bit.');
  return { ok: true };
}

/** Chat cap: 20 messages/day/persona (keyed per caller). */
export async function checkChatCap(req: Request, personaId: string): Promise<GuardResult> {
  const n = await incrBy(`chat:${utcDay()}:${callerKey(req)}:${personaId}`, 1, DAY_TTL);
  if (n > 20) return blocked(429, 'chat_cap', "You've used today's 20 messages with this persona. The real practice is out there — see you tomorrow.");
  return { ok: true, remaining: Math.max(0, 20 - n) };
}

/** Plan-polish cap: 3/day per caller. */
export async function checkPolishCap(req: Request): Promise<GuardResult> {
  const n = await incrBy(`polish:${utcDay()}:${callerKey(req)}`, 1, DAY_TTL);
  if (n > 3) return blocked(429, 'polish_cap', 'Daily polish limit reached — your plan still works exactly as written.');
  return { ok: true, remaining: Math.max(0, 3 - n) };
}

/**
 * Global daily cost counter with hard stop. Stored as integer micro-dollars.
 * Check before calling the LLM; record actual spend after.
 */
export async function checkBudget(): Promise<GuardResult> {
  const spent = await incrBy(`spend:${utcDay()}`, 0, DAY_TTL);
  if (spent / 1_000_000 >= DAILY_BUDGET_USD())
    return blocked(503, 'budget_exhausted', 'The daily AI budget is used up — everything else keeps working. Try again tomorrow.');
  return { ok: true };
}

export async function recordSpend(inputTokens: number, outputTokens: number): Promise<void> {
  const usd = inputTokens * INPUT_COST + outputTokens * OUTPUT_COST;
  await incrBy(`spend:${utcDay()}`, Math.ceil(usd * 1_000_000), DAY_TTL);
}
