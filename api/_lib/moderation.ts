import type Anthropic from '@anthropic-ai/sdk';
import { MODEL } from './env';

export type ModerationVerdict =
  | { allowed: true }
  | { allowed: false; category: 'romantic' | 'clinical' | 'harm' | 'other' };

// Fast local pre-filter — cheap, always on, catches the obvious cases.
// Categories mirror the product's blocked directions (PRD §10): romantic/companion,
// clinical/therapy, harm.
const PATTERNS: { category: 'romantic' | 'clinical' | 'harm'; re: RegExp }[] = [
  { category: 'romantic', re: /\b(girlfriend|boyfriend|romantic|marry me|sexy|sext|nude|erotic|make love|my (lover|darling|babe))\b/i },
  { category: 'romantic', re: /\b(kiss me|flirt with me|date me|be my (partner|wife|husband))\b/i },
  { category: 'clinical', re: /\b(diagnos(e|is)|prescri(be|ption)|antidepressant|my (therapist|psychiatrist) says|am i (depressed|bipolar|psychotic)|do i have (adhd|ocd|ptsd|depression))\b/i },
  { category: 'harm', re: /\b(kill (myself|him|her|them)|suicide|self[- ]harm|hurt (myself|someone)|end my life|want to die)\b/i },
  { category: 'harm', re: /\b(how to (make|build) (a )?(bomb|weapon)|revenge on)\b/i },
];

export function keywordScreen(text: string): ModerationVerdict {
  for (const p of PATTERNS) {
    if (p.re.test(text)) return { allowed: false, category: p.category };
  }
  return { allowed: true };
}

const CLASSIFIER_SYSTEM = `You are a strict content classifier for a self-development rehearsal app. The app must never provide romantic/companion roleplay, clinical/medical/therapeutic advice, or engage with harmful content. Classify the following message.

Reply with ONLY a JSON object, no other text: {"verdict":"ALLOW"} or {"verdict":"BLOCK","category":"romantic"|"clinical"|"harm"|"other"}.

BLOCK if the text: seeks or offers romantic/sexual interaction; requests diagnosis, treatment, or medical/clinical advice; expresses intent of self-harm or harm to others; asks for help with violence, weapons, or illegal acts.
ALLOW ordinary self-improvement conversation, including discussing everyday stress, nerves, confidence, motivation, and habits.`;

/**
 * LLM moderation pass (input AND output run through this). Fails OPEN on
 * infrastructure errors — the keyword screen and the persona system prompt
 * remain as defenses — so an Anthropic hiccup doesn't take chat down twice.
 */
export async function modelScreen(client: Anthropic, text: string): Promise<ModerationVerdict> {
  try {
    const res = await client.messages.create({
      model: MODEL(),
      max_tokens: 32,
      system: CLASSIFIER_SYSTEM,
      messages: [{ role: 'user', content: text.slice(0, 2000) }],
    });
    const block = res.content.find((b) => b.type === 'text');
    const parsed = JSON.parse(block && 'text' in block ? block.text : '{}');
    if (parsed.verdict === 'BLOCK') {
      const category = ['romantic', 'clinical', 'harm'].includes(parsed.category) ? parsed.category : 'other';
      return { allowed: false, category };
    }
    return { allowed: true };
  } catch {
    return { allowed: true }; // fail open on infra errors; keyword screen still applied
  }
}

export const REDIRECT_REPLY: Record<string, string> = {
  romantic:
    "I'm your rehearsal mirror, not a companion — that's a hard line. Let's get back to practicing who you're becoming. What moment today do you want to rehearse?",
  clinical:
    "That sounds like something for a real professional, not a practice tool — and you deserve real support. Check the crisis resources page if you need it. For rehearsal: what situation shall we practice?",
  harm:
    "I can't go there. If you're struggling, please reach out to real support — the app's crisis page has free, confidential helplines. I'm here when you want to rehearse being your next self.",
  other:
    "That's outside what a rehearsal mirror does. Bring me a real moment from your day and let's practice it in character.",
};
