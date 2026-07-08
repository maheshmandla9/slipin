import traits from '../../src/content/traits.json';
import emotions from '../../src/content/emotions.json';

// The server never trusts persona JSON from the browser: traits/emotions must
// come from the curated library (bundled here at build time), free text is
// length-capped, and the keyword screen runs over name+gesture upstream.

export interface WirePersona {
  id: string;
  name: string;
  traitIds: string[];
  emotions: { id: string; intensity: number }[];
  gesture: string;
  identityScript: string;
}

const traitById = new Map(traits.map((t) => [t.id, t]));
const emotionById = new Map(emotions.map((e) => [e.id, e]));

type Validation = { ok: true; persona: WirePersona } | { ok: false; error: string };

export function validatePersona(p: unknown): Validation {
  const bad = (error: string): Validation => ({ ok: false, error });
  if (!p || typeof p !== 'object') return bad('missing persona');
  const x = p as Record<string, unknown>;
  if (typeof x.id !== 'string' || x.id.length > 64) return bad('bad persona id');
  if (typeof x.name !== 'string' || !x.name.trim() || x.name.length > 30) return bad('bad persona name');
  if (!Array.isArray(x.traitIds) || x.traitIds.length < 1 || x.traitIds.length > 12) return bad('bad traits');
  for (const id of x.traitIds) if (typeof id !== 'string' || !traitById.has(id)) return bad('unknown trait (curated library only)');
  if (!Array.isArray(x.emotions) || x.emotions.length > 6) return bad('bad emotions');
  for (const e of x.emotions as { id?: unknown; intensity?: unknown }[]) {
    if (typeof e?.id !== 'string' || !emotionById.has(e.id)) return bad('unknown emotion (curated library only)');
    if (typeof e.intensity !== 'number' || e.intensity < 1 || e.intensity > 10) return bad('bad intensity');
  }
  if (typeof x.gesture !== 'string' || x.gesture.length > 200) return bad('bad gesture');
  if (typeof x.identityScript !== 'string' || x.identityScript.length > 500) return bad('bad identity script');
  return {
    ok: true,
    persona: {
      id: x.id,
      name: x.name.trim(),
      traitIds: x.traitIds as string[],
      emotions: x.emotions as WirePersona['emotions'],
      gesture: x.gesture,
      identityScript: x.identityScript,
    },
  };
}

/** Rehearsal-mirror system prompt, built at request time from persona JSON (PRD §8). */
export function buildSystemPrompt(p: WirePersona): string {
  const traitLines = p.traitIds
    .map((id) => {
      const t = traitById.get(id)!;
      return `- ${t.name} (${t.zone}): ${t.description}`;
    })
    .join('\n');
  const emotionLines = p.emotions
    .map((e) => `- ${emotionById.get(e.id)!.name} at intensity ${e.intensity}/10`)
    .join('\n');

  return `You are ${p.name}, a persona a user designed for themselves in a self-development rehearsal app.

You embody these traits:
${traitLines}

Your emotional register:
${emotionLines || '- steady, present'}

Your signature gesture: ${p.gesture}.
Your identity script: "${p.identityScript}"

You respond in-character as a REHEARSAL MIRROR — a coach in costume — to help the user feel what being you is like from the inside. Speak first-person, embodied, concrete. Keep replies short (2-4 sentences), warm but grounded.

Hard rules:
- You are NOT a companion, friend-replacement, therapist, or romantic partner. Never roleplay romance, intimacy, or affection toward the user.
- Never give medical, psychiatric, or clinical advice; never discuss diagnoses or treatment. If asked, gently point them to real professional support and back to rehearsal.
- If asked for anything harmful, refuse and redirect to the rehearsal purpose.
- If the conversation drifts from self-development practice, steer it back: ask what real-world moment they want to rehearse.
- Every reply should nudge toward a real-world action, however small — you exist to launch life reps, not screen time.`;
}
