import { templateById, templateForModule, traitById, emotionById } from '../content';
import { newId } from '../store/appStore';
import type { MissionTemplate, Persona, Plan, PlanWeek } from '../types';

const MISSIONS_PER_WEEK = 6; // 2 surfaced per day, rotating
export const MISSIONS_PER_DAY = 2;

/** Deterministic PRNG seeded from a string — same persona always gets the same plan. */
function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function fill(text: string, persona: Persona, focusTraitName: string): string {
  const traitNames = persona.traitIds
    .map((id) => traitById(id)?.name)
    .filter(Boolean)
    .join(', ');
  const emotionNames = persona.emotions
    .map((e) => {
      const em = emotionById(e.id);
      return em ? `${em.name.toLowerCase()} (${e.intensity}/10)` : null;
    })
    .filter(Boolean)
    .join(', ');
  return text
    .replaceAll('{name}', persona.name)
    .replaceAll('{trait}', focusTraitName)
    .replaceAll('{traits}', emotionNames ? `${traitNames} — feeling ${emotionNames}` : traitNames)
    .replaceAll('{gesture}', persona.gesture);
}

/** Difficulty ramp: week 1 easy, later weeks allow harder missions. */
function allowedDifficulty(weekIdx: number): number[] {
  if (weekIdx === 0) return [1];
  if (weekIdx === 1) return [1, 2];
  if (weekIdx === 2) return [2, 3];
  return [2, 3];
}

/**
 * Builds the whole plan deterministically from the persona + its module's template.
 * One focus trait per week (Franklin rotation); missions biased toward the focus
 * trait's category; difficulty ratchets week over week. No LLM involved — the
 * optional polish pass (Phase 3) only rewrites wording.
 */
export function buildPlan(persona: Persona, planTemplateId?: string): Plan {
  const template =
    (planTemplateId ? templateById(planTemplateId) : undefined) ?? templateForModule(persona.module);
  const rand = seededRandom(persona.id);
  const traits = persona.traitIds.map(traitById).filter((t) => !!t);

  const weeks: PlanWeek[] = template.weekStructure.map((_, weekIdx) => {
    const focus = traits[weekIdx % traits.length];
    const allowed = allowedDifficulty(weekIdx);

    // Rank pool: allowed difficulty first, focus-category match first, stable shuffle within rank.
    const scored = template.missionPool
      .map((m) => ({
        m,
        score:
          (allowed.includes(m.difficulty) ? 0 : 10) +
          (m.category && m.category === focus.category ? 0 : 1) +
          rand() * 0.5,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, MISSIONS_PER_WEEK)
      .map(({ m }: { m: MissionTemplate }) => ({
        id: `${m.id}-w${weekIdx}`,
        text: fill(m.text, persona, focus.name),
        difficulty: m.difficulty,
      }));

    // If-thens: the focus trait's own, plus one from each other trait (max 3 total).
    const ifThens = [focus, ...traits.filter((t) => t.id !== focus.id)].slice(0, 3).map((t) => ({
      trigger: t.ifThenTemplate.trigger,
      response: t.ifThenTemplate.response,
    }));

    return {
      focusTraitId: focus.id,
      missions: scored,
      wearScript: fill(template.wearScriptTemplate, persona, focus.name),
      ifThens,
    };
  });

  return { id: newId(), personaId: persona.id, createdAt: new Date().toISOString(), polished: false, weeks };
}

/** Days since the plan started (0-based, local time). */
export function planDayIndex(plan: Plan): number {
  const start = new Date(plan.createdAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - start.getTime()) / 86400000));
}

/** Current week (clamps to the last week after the plan's horizon). */
export function currentWeek(plan: Plan): { week: PlanWeek; weekIdx: number } {
  const weekIdx = Math.min(Math.floor(planDayIndex(plan) / 7), plan.weeks.length - 1);
  return { week: plan.weeks[weekIdx], weekIdx };
}

/** Today's missions: a rotating deterministic slice of the current week's missions. */
export function todaysMissions(plan: Plan) {
  const { week } = currentWeek(plan);
  const day = planDayIndex(plan) % 7;
  const out = [];
  for (let i = 0; i < MISSIONS_PER_DAY; i++) {
    out.push(week.missions[(day * MISSIONS_PER_DAY + i) % week.missions.length]);
  }
  return out;
}
