import { STORAGE_KEY } from '../store/storageKey';

/**
 * Corrupt-storage fail-safe (PRD §10). Runs before the store hydrates:
 * if the persisted blob doesn't parse, move it aside so the app boots fresh,
 * and keep the raw bytes available for the user to download from a banner.
 */
export let corruptBackup: string | null = null;

export function checkStorageHealth(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return;
    JSON.parse(raw);
  } catch (err) {
    try {
      corruptBackup = localStorage.getItem(STORAGE_KEY);
      if (corruptBackup) localStorage.setItem(`${STORAGE_KEY}-corrupt`, corruptBackup);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage itself unusable — app still runs in-memory
    }
    console.error('Persisted state was corrupt; moved aside and started fresh.', err);
  }
}

export function downloadCorruptBackup(): void {
  const data = corruptBackup ?? localStorage.getItem(`${STORAGE_KEY}-corrupt`);
  if (!data) return;
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'slipin-backup-corrupt.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function dismissCorruptBackup(): void {
  corruptBackup = null;
  try {
    localStorage.removeItem(`${STORAGE_KEY}-corrupt`);
  } catch {
    /* ignore */
  }
}
