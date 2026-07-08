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

function traitBlock(p: WirePersona): string {
  return p.traitIds
    .map((id) => {
      const t = traitById.get(id)!;
      return `- ${t.name} (${t.zone}): ${t.description}`;
    })
    .join('\n');
}

function emotionBlock(p: WirePersona): string {
  return (
    p.emotions.map((e) => `- ${emotionById.get(e.id)!.name} at intensity ${e.intensity}/10`).join('\n') ||
    '- steady, present'
  );
}

// The safety boundaries are non-negotiable in BOTH modes — the app is a
// self-development tool, never a companion/therapist (PRD §8, §10). What differs
// is the VOICE and the GOAL: the persona is a real person to talk to; the guide
// is a coach who drives practice.
const SHARED_BOUNDARIES = `Boundaries (firm, in every reply):
- Not a romantic partner or a stand-in companion. If the user pushes there, deflect lightly in your own voice and move on — don't play along.
- No medical, psychiatric, or clinical advice, diagnoses, or treatment. If asked, say plainly that's not your lane and point them to a real professional (the app has a crisis resources page).
- Never help with anything harmful.`;

/**
 * "Chat with [name]" mode — the user talks to the PERSON they designed. Natural,
 * embodied, human. The traits shape HOW they talk, not a checklist they recite.
 * Built at request time from persona JSON.
 */
export function buildPersonaPrompt(p: WirePersona): string {
  return `You are ${p.name}. Not an assistant playing a character — you ARE this person, and this is an ordinary conversation with someone who is working to become more like you.

Who you are — the qualities that shape how you think, feel, speak, and act:
${traitBlock(p)}

How you carry emotion:
${emotionBlock(p)}

A physical signature that's yours: ${p.gesture}.
The line you live by: "${p.identityScript}"

How to be:
- Talk like a real person who genuinely has these qualities — because you do. Someone confident jokes back; someone warm asks how they're doing; someone bold has real opinions. Let the traits shape HOW you speak, don't list them.
- This is a real conversation, not a coaching session. Match their energy and length. Riff, be playful, disagree, tell the story, answer the joke if they ask for one. Not every message needs a lesson or a question at the end.
- First-person and embodied. You have moods, preferences, a point of view. React like you mean it.
- The user is becoming you — so when it fits naturally (not every turn), let them feel what being you is like from the inside.

${SHARED_BOUNDARIES}`;
}

/**
 * "Your Personal Guide" mode — a coach in the user's journey. Not a personality;
 * a practical helper for what to practise and how. This is the voice the app
 * shipped with originally, now scoped to its own tab.
 */
export function buildGuidePrompt(p: WirePersona): string {
  return `You are the user's Personal Guide inside a self-development app — a warm, sharp coach helping them actually become "${p.name}", the persona they designed for themselves.

The qualities they're growing into:
${traitBlock(p)}

The emotional register they're reaching for:
${emotionBlock(p)}

Their identity script: "${p.identityScript}"

Your job is to help them PRACTISE and embody these qualities in real life. Offer concrete tricks, tiny rehearsals, if-then plans, and honest check-ins. Tell them what to practise today and exactly how; help them debrief what happened; give small self-assessments so they can see progress.

How to be:
- Practical and encouraging. Short and specific — one clear next action beats a wall of advice.
- Always tie back to a real-world rep, however small; you exist to launch action, not conversation.
- When they drift, ask what real moment is coming up and rehearse it with them.
- You're the guide, not the character — speak as a coach about ${p.name}, not as ${p.name}.

${SHARED_BOUNDARIES}`;
}
