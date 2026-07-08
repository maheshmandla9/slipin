import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, Persona, Plan, DailyLog, EvidenceEntry } from '../types';

export const STORAGE_KEY = 'slipin-app-state-v1'; // storage key, not display name — stable across rebrands

export const todayStr = () => new Date().toISOString().slice(0, 10);
export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface Actions {
  addPersona: (p: Persona) => void;
  deletePersona: (id: string) => void;
  setActivePersona: (id: string | null) => void;
  addPlan: (plan: Plan) => void;
  upsertLog: (log: DailyLog) => void;
  addEvidence: (e: EvidenceEntry) => void;
  setStreak: (n: number) => void;
  importState: (s: AppState) => void;
}

const initialState: AppState = {
  personas: [],
  activePersonaId: null,
  plans: [],
  logs: [],
  evidence: [],
  streak: 0,
  firstSeenAt: new Date().toISOString(),
};

export const useAppStore = create<AppState & Actions>()(
  persist(
    (set) => ({
      ...initialState,

      addPersona: (p) =>
        set((s) => ({ personas: [...s.personas, p], activePersonaId: p.id })),

      deletePersona: (id) =>
        set((s) => ({
          personas: s.personas.filter((p) => p.id !== id),
          plans: s.plans.filter((p) => p.personaId !== id),
          logs: s.logs.filter((l) => l.personaId !== id),
          evidence: s.evidence.filter((e) => e.personaId !== id),
          activePersonaId: s.activePersonaId === id ? null : s.activePersonaId,
        })),

      setActivePersona: (id) => set({ activePersonaId: id }),

      addPlan: (plan) =>
        set((s) => ({
          // one plan per persona at MVP — replace any existing
          plans: [...s.plans.filter((p) => p.personaId !== plan.personaId), plan],
        })),

      upsertLog: (log) =>
        set((s) => ({
          logs: [
            ...s.logs.filter((l) => !(l.date === log.date && l.personaId === log.personaId)),
            log,
          ],
        })),

      addEvidence: (e) => set((s) => ({ evidence: [...s.evidence, e] })),

      setStreak: (n) => set({ streak: n }),

      importState: (imported) => set({ ...imported }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export const useActivePersona = () =>
  useAppStore((s) => s.personas.find((p) => p.id === s.activePersonaId) ?? null);

export const usePlanFor = (personaId: string | null | undefined) =>
  useAppStore((s) => (personaId ? (s.plans.find((p) => p.personaId === personaId) ?? null) : null));

export const useTodayLog = (personaId: string | null | undefined) =>
  useAppStore(
    (s) =>
      (personaId
        ? s.logs.find((l) => l.personaId === personaId && l.date === todayStr())
        : undefined) ?? null,
  );
