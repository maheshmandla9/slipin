import { Link, useParams } from 'react-router-dom';
import { APP_NAME } from '../config/app';
import { MODULES, packsForModule, templateById } from '../content';

// Missions from plan-actor that showcase the body-language/voice drills on the
// landing page — pulled live from content so the preview can never drift out
// of sync with what's actually in the daily loop.
const ACTOR_DRILL_MISSION_IDS = ['m-act-14', 'm-act-15', 'm-act-13'];

// Per-module landing copy for niche acquisition channels (BRD §3.4):
// /m/actor, /m/student, … are the URLs shared in each community.
const COPY: Record<string, { headline: string; sub: string; bullets: string[] }> = {
  actor: {
    headline: 'Build your character. Then become them.',
    sub: 'Structured role prep from Stanislavski to Chekhov — dress a character on a living avatar, feel them in conversation, drill them daily.',
    bullets: ['The Magic If, psychological gesture & voice/walk drills as daily reps', 'Chat with your character to find their voice before rehearsal', 'Deadline mode: a focused plan for the weeks before your role'],
  },
  'self-transform': {
    headline: 'Stop tracking habits. Start rehearsing identity.',
    sub: 'Design the person you want to become, wear them every morning, and collect evidence you\'re changing — visible in 30 days.',
    bullets: ['Morning wear-sessions: 3 minutes of guided identity rehearsal', 'One trait per week — the Franklin method, not overwhelm', 'A then-vs-now report that proves the change to yourself'],
  },
  student: {
    headline: 'The confident version of you already exists. Practice being them.',
    sub: 'Shyness, procrastination, speaking up in class — build the student you want to be and level them up with tiny daily missions.',
    bullets: ['Missions that take under 60 seconds on day one', 'Speak-in-the-first-five-minutes drills that actually work', 'Streaks, proof log, and a shareable persona card'],
  },
  emotional: {
    headline: 'Respond on purpose. Every time.',
    sub: 'A private, anonymous practice for staying steady in hot moments — pattern interrupts, anchors, and one-rung-at-a-time emotional laddering.',
    bullets: ['"Old me or new me?" mid-day pattern interrupts', 'A physical anchor you can fire before any hard moment', 'Non-clinical by design: practice, not treatment'],
  },
  animal: {
    headline: 'Borrow the lion\'s courage.',
    sub: 'Pick an animal persona, get its human trait set, and walk into your day wearing it. Silly? A little. Effective? Extremely.',
    bullets: ['Lion courage mapped to real behavioral science', 'The Batman effect: third-person self-talk that works', 'The most shareable persona cards in the app'],
  },
  physical: {
    headline: 'The body follows the person you practice being.',
    sub: 'Two weeks of identity prep before the gym: become someone who never misses twice, finishes everything, and recovers on purpose.',
    bullets: ['Mind-first prep for any physical transformation', 'Show-up-daily habits with a never-miss-twice rule', 'Built for the start — the hardest part of any program'],
  },
  manifestation: {
    headline: 'Manifestation with a work ethic.',
    sub: 'Vivid future-self visualization, felt gratitude, and one aligned real-world action every day. The psychology, not the magic.',
    bullets: ['Sensory future-self scripts, morning and night', 'Daily evidence hunt trains your attention on what\'s working', 'Every vision generates one tiny real step per day'],
  },
  freehand: {
    headline: 'Build exactly who you\'re becoming.',
    sub: 'The full curated trait and emotion library, zone by zone, on a living avatar. For people who know what they want.',
    bullets: ['40+ curated traits across beliefs, emotions, voice, action, habits', 'Hawkins-laddered emotional intensities', 'Your persona, your plan, your proof'],
  },
  icons: {
    headline: 'Whose mindset will you wear?',
    sub: 'Train the qualities the greats are known for — the discipline, the fire, the focus. Not fan fiction: a daily practice built from their publicly documented mindsets.',
    bullets: ['Mindset packs inspired by legends of sport, cinema, science, and myth', 'Chat with the mindset to feel it — then live it in daily missions', 'Don\'t see your icon? Request them with one tap'],
  },
  screen: {
    headline: 'Step off the couch and into the character.',
    sub: 'The archetypes you love from the movies — the genius inventor, the underdog champion, the unstoppable professional — turned into daily identity practice.',
    bullets: ['Archetype packs with the exact traits that make those characters magnetic', 'Name your persona after whoever inspires you — it\'s yours', 'Built on real acting craft: the Magic If, psychological gesture, voice drills'],
  },
  anime: {
    headline: 'Your training arc starts today.',
    sub: 'Shonen spirit, silent precision, gentle strength — wear the energy of your favorite heroes in real life. Cosplay-ready confidence included.',
    bullets: ['Hero archetypes with real behavioral science underneath', 'Perfect prep for cosplay and comic-con embodiment', 'Level up daily: missions, streaks, and visible proof of the arc'],
  },
  mimicry: {
    headline: 'Learn to become anyone.',
    sub: 'The craft of imitation, taught as a ladder: eye first, then body, then voice. Pick any study subject — your favorite performer, speaker, or friend.',
    bullets: ['The observation ladder: posture → gesture → rhythm → voice', 'Record-and-compare drills that sharpen fast', 'Respectful by design — celebration, never mockery'],
  },
};

export default function ModuleLanding() {
  const { moduleId } = useParams();
  const meta = MODULES.find((m) => m.id === moduleId);
  const copy = moduleId ? COPY[moduleId] : undefined;
  if (!meta || !copy) {
    return (
      <main className="p-10 text-center">
        <Link to="/" className="text-accent underline">← {APP_NAME}</Link>
      </main>
    );
  }
  const packs = packsForModule(meta.id);

  // Live preview of the body-language/voice drills for the actor landing page —
  // pulled straight from plan-actor's mission pool (never bundled as static copy).
  const drillPreview =
    meta.id === 'actor'
      ? ACTOR_DRILL_MISSION_IDS.map((id) =>
          templateById('plan-actor')?.missionPool.find((m) => m.id === id)?.text.replace(/\{name\}/g, 'your character'),
        ).filter((t): t is string => !!t)
      : [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-14 text-center">
      <div className="text-6xl">{meta.emoji}</div>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.headline}</h1>
      <p className="mx-auto mt-4 max-w-lg text-ink/70">{copy.sub}</p>
      <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
        {copy.bullets.map((b) => (
          <li key={b} className="flex gap-3 rounded-xl border border-ink/10 bg-white p-3 text-sm">
            <span className="text-accent">✓</span> {b}
          </li>
        ))}
      </ul>

      {drillPreview.length > 0 && (
        <div className="mx-auto mt-6 max-w-md rounded-xl border-2 border-accent/30 bg-accent-soft/40 p-5 text-left">
          <p className="text-sm font-bold text-accent">🎤 Body-language & voice drills, built in</p>
          <p className="mt-1 text-xs text-ink/60">
            As you progress through your daily missions, you'll get drills like these to actually train the physical and vocal side of the character — not just the mindset:
          </p>
          <ul className="mt-3 space-y-2">
            {drillPreview.map((text) => (
              <li key={text} className="rounded-lg bg-white/70 p-2.5 text-xs text-ink/80">“{text}”</li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to={`/build/${meta.id}`}
        className="mt-10 inline-block rounded-xl bg-accent px-8 py-3.5 text-lg font-bold text-white shadow-lg hover:bg-accent/85"
      >
        Create your persona — free, no signup
      </Link>
      <p className="mt-3 text-xs text-ink/50">
        Anonymous. Your data never leaves your browser.{packs.length ? ` Start from the ${packs[0].name} pack in under 3 minutes.` : ''}
      </p>
    </main>
  );
}
