// Env access that works in the Vercel Edge runtime without @types/node.
export const env = (key: string): string | undefined =>
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[key];

/** Kill-switches default ON; set the var to "false" to disable a feature. */
export const flagEnabled = (key: string): boolean =>
  (env(key) ?? 'true').toLowerCase() !== 'false';

export const MODEL = () => env('MODEL') ?? 'claude-haiku-4-5';
export const DAILY_BUDGET_USD = () => Number(env('DAILY_BUDGET_USD') ?? '5');

// claude-haiku-4-5 pricing (USD per token)
export const INPUT_COST = 1 / 1_000_000;
export const OUTPUT_COST = 5 / 1_000_000;
