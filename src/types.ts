// Data model per docs/PRD.md §7
export type Zone = 'head' | 'chest' | 'mouth' | 'hands' | 'feet';

export type ModuleId =
  | 'actor'
  | 'self-transform'
  | 'student'
  | 'emotional'
  | 'animal'
  | 'physical'
  | 'manifestation'
  | 'freehand';

export interface Trait {
  id: string;
  name: string;
  zone: Zone;
  category: string;
  description: string;
  reframeScript: string;
  ifThenTemplate: { trigger: string; response: string };
  hawkinsLevel?: number;
}

export interface EmotionalQuality {
  id: string;
  name: string;
  hawkinsLevel: number;
  intensityRange: [number, number];
  description: string;
}

export interface Technique {
  id: string;
  name: string;
  source: string;
  steps: string[];
  durationMin: number;
}

/** Floating testimonial-style quotes shown in page margins (`FloatingQuotes`). */
export interface Quote {
  id: string;
  text: string;
  author?: string;
  /** Page keys this quote is eligible to appear on — e.g. 'home', 'today', 'chat'. */
  pages: string[];
  /** Preferred margin; if omitted, quotes alternate left/right in list order. */
  side?: 'left' | 'right';
}

export interface MissionTemplate {
  id: string;
  text: string; // may contain {name} / {trait} placeholders
  difficulty: 1 | 2 | 3;
  category?: string; // matches Trait.category to bias selection toward the focus trait
}

export interface PlanTemplate {
  id: string;
  module: ModuleId;
  weekStructure: string[]; // theme per week, index = week number
  missionPool: MissionTemplate[];
  wearScriptTemplate: string; // {name}, {traits}, {gesture} placeholders
}

export interface EmotionSetting {
  id: string;
  intensity: number; // within the emotion's intensityRange
}

export interface Pack {
  id: string;
  module: ModuleId;
  name: string;
  description: string;
  traitIds: string[];
  emotions: EmotionSetting[];
  planTemplateId: string;
  gesture: string;
  identityScript: string;
  animalMeta?: { animal: string; emoji: string };
}

export interface Persona {
  id: string;
  name: string;
  module: ModuleId;
  traitIds: string[];
  emotions: EmotionSetting[];
  gesture: string;
  identityScript: string;
  createdAt: string; // ISO
}

export interface PlanMission {
  id: string;
  text: string;
  difficulty: 1 | 2 | 3;
}

export interface PlanWeek {
  focusTraitId: string;
  missions: PlanMission[];
  wearScript: string;
  ifThens: { trigger: string; response: string }[];
}

export interface Plan {
  id: string;
  personaId: string;
  createdAt: string;
  polished: boolean; // true if LLM polish applied
  weeks: PlanWeek[];
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  personaId: string;
  intentDone: boolean;
  wearDone: boolean;
  missionsDone: string[]; // mission ids
  debrief?: { score: number; win: string; slip: string };
}

export interface EvidenceEntry {
  id: string;
  date: string;
  personaId: string;
  text: string;
  missionId?: string;
}

export interface AppState {
  personas: Persona[];
  activePersonaId: string | null;
  plans: Plan[];
  logs: DailyLog[];
  evidence: EvidenceEntry[];
  streak: number;
  firstSeenAt: string;
}
