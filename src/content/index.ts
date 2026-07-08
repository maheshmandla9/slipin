import { z } from 'zod';
import type { Trait, EmotionalQuality, Technique, Pack, PlanTemplate, ModuleId, Quote } from '../types';
import traitsJson from './traits.json';
import emotionsJson from './emotions.json';
import techniquesJson from './techniques.json';
import packsJson from './packs.json';
import planTemplatesJson from './planTemplates.json';
import quotesJson from './quotes.json';

const zone = z.enum(['head', 'chest', 'mouth', 'hands', 'feet']);
const moduleId = z.enum([
  'actor',
  'self-transform',
  'student',
  'emotional',
  'animal',
  'physical',
  'manifestation',
  'freehand',
]);

const traitSchema = z.object({
  id: z.string(),
  name: z.string(),
  zone,
  category: z.string(),
  description: z.string(),
  reframeScript: z.string(),
  ifThenTemplate: z.object({ trigger: z.string(), response: z.string() }),
  hawkinsLevel: z.number().optional(),
});

const emotionSchema = z.object({
  id: z.string(),
  name: z.string(),
  hawkinsLevel: z.number(),
  intensityRange: z.tuple([z.number(), z.number()]),
  description: z.string(),
});

const techniqueSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.string(),
  steps: z.array(z.string()),
  durationMin: z.number(),
});

const missionSchema = z.object({
  id: z.string(),
  text: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  category: z.string().optional(),
});

const planTemplateSchema = z.object({
  id: z.string(),
  module: moduleId,
  weekStructure: z.array(z.string()),
  missionPool: z.array(missionSchema),
  wearScriptTemplate: z.string(),
});

const packSchema = z.object({
  id: z.string(),
  module: moduleId,
  name: z.string(),
  description: z.string(),
  traitIds: z.array(z.string()),
  emotions: z.array(z.object({ id: z.string(), intensity: z.number() })),
  planTemplateId: z.string(),
  gesture: z.string(),
  identityScript: z.string(),
  animalMeta: z.object({ animal: z.string(), emoji: z.string() }).optional(),
});

const quoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string().optional(),
  pages: z.array(z.string()).min(1),
  side: z.enum(['left', 'right']).optional(),
});

export const TRAITS: Trait[] = z.array(traitSchema).parse(traitsJson);
export const EMOTIONS: EmotionalQuality[] = z.array(emotionSchema).parse(emotionsJson);
export const TECHNIQUES: Technique[] = z.array(techniqueSchema).parse(techniquesJson);
export const PLAN_TEMPLATES: PlanTemplate[] = z.array(planTemplateSchema).parse(planTemplatesJson);
export const PACKS: Pack[] = z.array(packSchema).parse(packsJson);
export const QUOTES: Quote[] = z.array(quoteSchema).parse(quotesJson);

// Referential integrity — fail loudly at startup in dev if content is inconsistent.
const traitIds = new Set(TRAITS.map((t) => t.id));
const emotionIds = new Set(EMOTIONS.map((e) => e.id));
const templateIds = new Set(PLAN_TEMPLATES.map((p) => p.id));
for (const pack of PACKS) {
  for (const id of pack.traitIds) if (!traitIds.has(id)) throw new Error(`Pack ${pack.id}: unknown trait ${id}`);
  for (const e of pack.emotions) if (!emotionIds.has(e.id)) throw new Error(`Pack ${pack.id}: unknown emotion ${e.id}`);
  if (!templateIds.has(pack.planTemplateId)) throw new Error(`Pack ${pack.id}: unknown template ${pack.planTemplateId}`);
}

export const traitById = (id: string) => TRAITS.find((t) => t.id === id);
export const emotionById = (id: string) => EMOTIONS.find((e) => e.id === id);
export const packById = (id: string) => PACKS.find((p) => p.id === id);
export const templateById = (id: string) => PLAN_TEMPLATES.find((p) => p.id === id);
export const packsForModule = (m: ModuleId) => PACKS.filter((p) => p.module === m);

/** Default plan template per module; freehand and modules without a dedicated template use plan-core. */
export const templateForModule = (m: ModuleId): PlanTemplate =>
  PLAN_TEMPLATES.find((p) => p.module === m) ?? PLAN_TEMPLATES.find((p) => p.id === 'plan-core')!;

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  tagline: string;
  emoji: string;
}

export const MODULES: ModuleMeta[] = [
  { id: 'actor', name: 'Actor Prep', tagline: 'Build a character you can wear on stage and in the room.', emoji: '🎭' },
  { id: 'self-transform', name: 'Self-Transformation', tagline: 'Design the next version of you and practice being them daily.', emoji: '🦋' },
    { id: 'manifestation', name: 'Manifestation', tagline: 'Vivid vision, felt gratitude, one aligned step per day.', emoji: '🧘🪄' },
  { id: 'student', name: 'Student', tagline: 'Confidence, focus, and a voice that shows up in class.', emoji: '🎓' },
  { id: 'animal', name: 'Animal Personas', tagline: 'Borrow the lion’s courage. Seriously — it works.', emoji: '🦁' },
  { id: 'physical', name: 'Physical Prep', tagline: 'Become the athlete in your head before the gym.', emoji: '💪' },
  { id: 'emotional', name: 'Emotional Management', tagline: 'Stay steady in hot moments — respond, don’t react.', emoji: '❤️‍🔥🕊️' },
  { id: 'freehand', name: 'Free-Hand', tagline: 'Build from the full library, zone by zone.', emoji: '🎨' },
];

export const moduleMeta = (m: ModuleId) => MODULES.find((x) => x.id === m)!;

/** Quotes eligible for a given page key (e.g. 'home', 'today') — new ones just need that key in their `pages` array. */
export const quotesForPage = (page: string) => QUOTES.filter((q) => q.pages.includes(page));
