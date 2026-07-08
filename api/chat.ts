import { createMessage } from './_lib/anthropic';
import { env, flagEnabled } from './_lib/env';
import { checkBudget, checkChatCap, checkRate, recordSpend } from './_lib/guards';
import { keywordScreen, modelScreen, REDIRECT_REPLY } from './_lib/moderation';
import { buildGuidePrompt, buildPersonaPrompt, validatePersona } from './_lib/persona';
import { captureError } from './_lib/sentry';

export const config = { runtime: 'edge' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fail = (status: number, code: string, message: string) => json({ error: code, message }, status);

interface WireMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return fail(405, 'method_not_allowed', 'POST only');
  if (!flagEnabled('CHAT_ENABLED')) return fail(503, 'chat_disabled', 'Chat is taking a break — everything else still works.');
  const apiKey = env('ANTHROPIC_API_KEY');
  if (!apiKey) return fail(503, 'llm_unavailable', 'Chat is unavailable right now — the rest of the app works offline.');

  try {
    const rate = await checkRate(req);
    if (!rate.ok) return fail(rate.status!, rate.code!, rate.message!);
    const budget = await checkBudget();
    if (!budget.ok) return fail(budget.status!, budget.code!, budget.message!);

    const body = (await req.json().catch(() => null)) as { persona?: unknown; messages?: WireMessage[]; mode?: unknown } | null;
    const v = validatePersona(body?.persona);
    if (!v.ok) return fail(400, 'invalid_persona', v.error);
    const persona = v.persona;
    // Two conversational modes share this endpoint: 'persona' = talk to the
    // designed character (human, longer); 'guide' = a practice coach (shorter).
    const mode = body?.mode === 'guide' ? 'guide' : 'persona';

    const messages = (body?.messages ?? []).slice(-12).filter(
      (m): m is WireMessage =>
        !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length > 0,
    );
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user') return fail(400, 'invalid_messages', 'last message must be from the user');
    if (last.content.length > 1000) return fail(400, 'too_long', 'Keep messages under 1000 characters.');

    const cap = await checkChatCap(req, persona.id);
    if (!cap.ok) return fail(cap.status!, cap.code!, cap.message!);

    // Moderation IN: keyword screen (name/gesture/inspiration too — free-ish text) + model screen
    const inputScreen = keywordScreen(`${persona.name} ${persona.gesture} ${persona.inspiration ?? ''} ${last.content}`);
    const modIn = inputScreen.allowed ? await modelScreen(last.content) : inputScreen;
    if (!modIn.allowed) {
      return json({ blocked: true, category: modIn.category, reply: REDIRECT_REPLY[modIn.category], remaining: cap.remaining });
    }

    const res = await createMessage({
      // Persona replies get room to feel like a real conversation; the guide
      // stays tight and practical.
      max_tokens: mode === 'guide' ? 320 : 512,
      system: mode === 'guide' ? buildGuidePrompt(persona) : buildPersonaPrompt(persona),
      messages: messages.map((m) => ({ role: m.role, content: m.content.slice(0, 1000) })),
    });
    await recordSpend(res.usage.input_tokens, res.usage.output_tokens);

    const reply = res.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('')
      .trim();
    if (!reply) return fail(502, 'empty_reply', 'The persona went quiet — try again.');

    // Moderation OUT
    const modOut = keywordScreen(reply).allowed ? await modelScreen(reply) : keywordScreen(reply);
    if (!modOut.allowed) {
      return json({ blocked: true, category: modOut.category, reply: REDIRECT_REPLY[modOut.category], remaining: cap.remaining });
    }

    return json({ reply, remaining: cap.remaining });
  } catch (err) {
    await captureError(err, { fn: 'chat' });
    return fail(502, 'llm_error', 'Something hiccuped talking to the persona. Try again in a moment.');
  }
}
