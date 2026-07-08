import { env } from './env';

/**
 * Counter store for caps & budget. Uses Upstash Redis REST when configured
 * (counters only — never user data). Falls back to per-isolate in-memory
 * counters (best effort: resets on cold start, not shared across regions).
 */

const memory = new Map<string, { value: number; expiresAt: number }>();

function memIncrBy(key: string, amount: number, ttlSec: number): number {
  const now = Date.now();
  const cur = memory.get(key);
  if (!cur || cur.expiresAt < now) {
    memory.set(key, { value: amount, expiresAt: now + ttlSec * 1000 });
    return amount;
  }
  cur.value += amount;
  return cur.value;
}

/** Atomically add `amount` to `key` (creating with `ttlSec` expiry) and return the new value. */
export async function incrBy(key: string, amount: number, ttlSec: number): Promise<number> {
  const url = env('UPSTASH_REDIS_REST_URL');
  const token = env('UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) return memIncrBy(key, amount, ttlSec);

  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify([
      ['INCRBY', key, String(amount)],
      ['EXPIRE', key, String(ttlSec), 'NX'],
    ]),
  });
  if (!res.ok) throw new Error(`counter store error ${res.status}`);
  const rows = (await res.json()) as { result?: number; error?: string }[];
  if (rows[0]?.error) throw new Error(`counter store: ${rows[0].error}`);
  return Number(rows[0].result);
}

export const utcDay = () => new Date().toISOString().slice(0, 10);

/** Anonymized caller key: FNV-1a hash of the client IP — raw IPs are never stored. */
export function callerKey(req: Request): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  let h = 0x811c9dc5;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
