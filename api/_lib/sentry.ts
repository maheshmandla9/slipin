import { env } from './env';

/**
 * Minimal Sentry reporter for the edge runtime (envelope API via fetch —
 * avoids pulling the full SDK into both functions). No-ops without SENTRY_DSN.
 */
export async function captureError(err: unknown, context: Record<string, string> = {}): Promise<void> {
  console.error('[edge-error]', context.fn ?? '', err);
  const dsn = env('SENTRY_DSN');
  if (!dsn) return;
  try {
    const m = dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(\d+)$/);
    if (!m) return;
    const [, key, host, projectId] = m;
    const eventId = crypto.randomUUID().replaceAll('-', '');
    const timestamp = new Date().toISOString();
    const event = {
      event_id: eventId,
      timestamp,
      platform: 'javascript',
      level: 'error',
      tags: context,
      exception: {
        values: [
          {
            type: err instanceof Error ? err.name : 'Error',
            value: err instanceof Error ? err.message : String(err),
          },
        ],
      },
    };
    const envelope =
      JSON.stringify({ event_id: eventId, sent_at: timestamp, dsn }) +
      '\n' +
      JSON.stringify({ type: 'event' }) +
      '\n' +
      JSON.stringify(event);
    await fetch(`https://${host}/api/${projectId}/envelope/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope', 'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${key}` },
      body: envelope,
    });
  } catch {
    // never let telemetry break the request
  }
}
