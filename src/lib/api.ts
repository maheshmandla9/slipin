import type { Persona, Plan } from '../types';

// All LLM traffic goes through the two edge functions — never direct from the
// browser. Every helper degrades to a typed error the UI renders as a notice.

export interface ChatResult {
  ok: boolean;
  reply?: string;
  blocked?: boolean;
  remaining?: number;
  errorCode?: string;
  message?: string;
}

export interface PolishResult {
  ok: boolean;
  weeks?: { missions: { id: string; text: string }[]; wearScript: string }[];
  errorCode?: string;
  message?: string;
}

const wirePersona = (p: Persona) => ({
  id: p.id,
  name: p.name,
  traitIds: p.traitIds,
  emotions: p.emotions,
  gesture: p.gesture,
  identityScript: p.identityScript,
});

async function post(path: string, body: unknown): Promise<{ status: number; data: Record<string, unknown> } | null> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) return null; // dev server / offline → treat as unavailable
    return { status: res.status, data: await res.json() };
  } catch {
    return null; // network down → offline mode
  }
}

export async function sendChat(persona: Persona, messages: { role: 'user' | 'assistant'; content: string }[]): Promise<ChatResult> {
  const res = await post('/api/chat', { persona: wirePersona(persona), messages });
  if (!res) return { ok: false, errorCode: 'offline', message: 'Chat needs a connection — everything else works offline.' };
  const d = res.data;
  if (res.status !== 200) return { ok: false, errorCode: String(d.error ?? 'error'), message: String(d.message ?? 'Chat is unavailable.') };
  return {
    ok: true,
    reply: String(d.reply ?? ''),
    blocked: Boolean(d.blocked),
    remaining: typeof d.remaining === 'number' ? d.remaining : undefined,
  };
}

export async function polishPlan(persona: Persona, plan: Plan): Promise<PolishResult> {
  const payload = {
    persona: wirePersona(persona),
    weeks: plan.weeks.map((w) => ({
      missions: w.missions.map((m) => ({ id: m.id, text: m.text })),
      wearScript: w.wearScript,
    })),
  };
  const res = await post('/api/plan', payload);
  if (!res) return { ok: false, errorCode: 'offline', message: 'Polish needs a connection — your plan works as-is.' };
  const d = res.data;
  if (res.status !== 200) return { ok: false, errorCode: String(d.error ?? 'error'), message: String(d.message ?? 'Polish unavailable.') };
  return { ok: true, weeks: d.weeks as PolishResult['weeks'] };
}
