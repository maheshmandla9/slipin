// Minimal browser error reporting via Sentry envelope API — no SDK, no-op without DSN.
const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

function send(err: unknown, extra: Record<string, string> = {}): void {
  if (!DSN) return;
  try {
    const m = DSN.match(/^https:\/\/([^@]+)@([^/]+)\/(\d+)$/);
    if (!m) return;
    const [, key, host, projectId] = m;
    const eventId = crypto.randomUUID().replaceAll('-', '');
    const timestamp = new Date().toISOString();
    const event = {
      event_id: eventId,
      timestamp,
      platform: 'javascript',
      level: 'error',
      tags: extra,
      request: { url: location.href },
      exception: {
        values: [
          {
            type: err instanceof Error ? err.name : 'Error',
            value: err instanceof Error ? err.message : String(err).slice(0, 500),
            ...(err instanceof Error && err.stack ? { raw_stacktrace: undefined } : {}),
          },
        ],
      },
    };
    const envelope =
      JSON.stringify({ event_id: eventId, sent_at: timestamp, dsn: DSN }) +
      '\n' +
      JSON.stringify({ type: 'event' }) +
      '\n' +
      JSON.stringify(event);
    void fetch(`https://${host}/api/${projectId}/envelope/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope', 'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${key}` },
      body: envelope,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // telemetry never breaks the app
  }
}

export function initErrorReporting(): void {
  window.addEventListener('error', (e) => send(e.error ?? e.message, { source: 'window.onerror' }));
  window.addEventListener('unhandledrejection', (e) => send(e.reason, { source: 'unhandledrejection' }));
}

export const captureError = send;
