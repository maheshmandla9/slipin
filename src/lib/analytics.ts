// PostHog via capture REST API — no SDK dependency, silent no-op without a key.
const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com';

const DISTINCT_KEY = 'slipin-anon-id';

function distinctId(): string {
  try {
    let id = localStorage.getItem(DISTINCT_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DISTINCT_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

export type AppEvent =
  | 'persona_created'
  | 'wear_session_done'
  | 'mission_done'
  | 'debrief_done'
  | 'chat_msg'
  | 'plan_generated'
  | 'plan_polished'
  | 'report_viewed'
  | 'card_shared'
  | 'moderation_blocked'
  | 'persona_requested'
  | 'llm_error';

export function track(event: AppEvent, properties: Record<string, string | number | boolean> = {}): void {
  if (!KEY) return;
  try {
    void fetch(`${HOST}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: KEY,
        event,
        distinct_id: distinctId(),
        properties: { ...properties, $current_url: location.pathname },
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // analytics must never break the app
  }
}
