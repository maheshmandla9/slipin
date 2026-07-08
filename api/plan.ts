import Anthropic from '@anthropic-ai/sdk';
import { env, flagEnabled, MODEL } from './_lib/env';
import { checkBudget, checkPolishCap, checkRate, recordSpend } from './_lib/guards';
import { buildSystemPrompt, validatePersona } from './_lib/persona';
import { captureError } from './_lib/sentry';

export const config = { runtime: 'edge' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const fail = (status: number, code: string, message: string) => json({ error: code, message }, status);

// The template engine (frontend) builds the plan deterministically; this
// endpoint ONLY rewrites wording in the persona's voice. Strict JSON out;
// any parse/shape failure → client keeps template text (PRD §8).

interface WireWeek {
  missions: { id: string; text: string }[];
  wearScript: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return fail(405, 'method_not_allowed', 'POST only');
  if (!flagEnabled('POLISH_ENABLED')) return fail(503, 'polish_disabled', 'Plan polish is off right now — the template plan works as-is.');
  const apiKey = env('ANTHROPIC_API_KEY');
  if (!apiKey) return fail(503, 'llm_unavailable', 'Polish is unavailable — your template plan is complete without it.');

  try {
    const rate = await checkRate(req);
    if (!rate.ok) return fail(rate.status!, rate.code!, rate.message!);
    const budget = await checkBudget();
    if (!budget.ok) return fail(budget.status!, budget.code!, budget.message!);

    const body = (await req.json().catch(() => null)) as { persona?: unknown; weeks?: WireWeek[] } | null;
    const v = validatePersona(body?.persona);
    if (!v.ok) return fail(400, 'invalid_persona', v.error);
    const weeks = body?.weeks;
    if (
      !Array.isArray(weeks) ||
      weeks.length < 1 ||
      weeks.length > 6 ||
      !weeks.every(
        (w) =>
          typeof w?.wearScript === 'string' &&
          Array.isArray(w.missions) &&
          w.missions.length <= 10 &&
          w.missions.every((m) => typeof m?.id === 'string' && typeof m?.text === 'string' && m.text.length <= 400),
      )
    ) {
      return fail(400, 'invalid_plan', 'bad plan payload');
    }

    const cap = await checkPolishCap(req);
    if (!cap.ok) return fail(cap.status!, cap.code!, cap.message!);

    const client = new Anthropic({ apiKey });
    const prompt = `Below is a JSON transformation plan. Rewrite ONLY the wording of each mission "text" and each "wearScript" so they sound like they were written by the persona described in your instructions — same meaning, same actions, same structure and numbering, just their voice. Keep every "id" EXACTLY as given. Keep each mission text under 220 characters. Keep wear scripts under 900 characters.

Return ONLY the JSON object, identical shape: {"weeks":[{"missions":[{"id":"...","text":"..."}],"wearScript":"..."}]}. No markdown, no commentary.

${JSON.stringify({ weeks })}`;

    const res = await client.messages.create({
      model: MODEL(),
      max_tokens: 4000,
      system: buildSystemPrompt(v.persona),
      messages: [{ role: 'user', content: prompt }],
    });
    await recordSpend(res.usage.input_tokens, res.usage.output_tokens);

    const text = res.content
      .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()
      .replace(/^```(json)?/i, '')
      .replace(/```$/, '');

    let polished: { weeks?: WireWeek[] };
    try {
      polished = JSON.parse(text);
    } catch {
      return fail(502, 'parse_failed', 'Polish came back malformed — keeping your template plan.');
    }

    // Shape check: same week count, same mission ids, sane lengths. Anything off → reject.
    if (!Array.isArray(polished.weeks) || polished.weeks.length !== weeks.length) {
      return fail(502, 'shape_mismatch', 'Polish result did not match the plan — keeping template.');
    }
    for (let i = 0; i < weeks.length; i++) {
      const orig = weeks[i];
      const pol = polished.weeks[i];
      if (
        typeof pol?.wearScript !== 'string' ||
        pol.wearScript.length < 20 ||
        pol.wearScript.length > 1500 ||
        !Array.isArray(pol.missions) ||
        pol.missions.length !== orig.missions.length ||
        !pol.missions.every(
          (m, j) => m?.id === orig.missions[j].id && typeof m.text === 'string' && m.text.length >= 10 && m.text.length <= 400,
        )
      ) {
        return fail(502, 'shape_mismatch', 'Polish result did not match the plan — keeping template.');
      }
    }

    return json({ weeks: polished.weeks, remaining: cap.remaining });
  } catch (err) {
    await captureError(err, { fn: 'plan' });
    return fail(502, 'llm_error', 'Polish failed — your template plan is untouched and fully usable.');
  }
}
