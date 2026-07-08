import { useAppStore } from '../store/appStore';
import type { AppState } from '../types';

/** Anonymous continuity: export/import = download/upload of the single state blob (PRD F9). */
export function exportData(): void {
  const s = useAppStore.getState();
  const data: AppState = {
    personas: s.personas,
    activePersonaId: s.activePersonaId,
    plans: s.plans,
    logs: s.logs,
    evidence: s.evidence,
    streak: s.streak,
    firstSeenAt: s.firstSeenAt,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `persona-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<{ ok: boolean; message: string }> {
  try {
    const parsed = JSON.parse(await file.text()) as AppState;
    if (!Array.isArray(parsed.personas) || !Array.isArray(parsed.logs) || !Array.isArray(parsed.evidence) || !Array.isArray(parsed.plans)) {
      return { ok: false, message: "That file doesn't look like an export from this app." };
    }
    useAppStore.getState().importState({
      personas: parsed.personas,
      activePersonaId: parsed.activePersonaId ?? parsed.personas[0]?.id ?? null,
      plans: parsed.plans,
      logs: parsed.logs,
      evidence: parsed.evidence,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      firstSeenAt: parsed.firstSeenAt ?? new Date().toISOString(),
    });
    return { ok: true, message: `Imported ${parsed.personas.length} persona(s) and ${parsed.logs.length} day(s) of practice.` };
  } catch {
    return { ok: false, message: "Couldn't read that file — is it the JSON you exported?" };
  }
}
