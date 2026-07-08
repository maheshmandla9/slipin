// Standalone so the corrupt-storage check can run BEFORE the store module
// evaluates (importing appStore.ts hydrates the store immediately).
export const STORAGE_KEY = 'slipin-app-state-v1'; // storage key, not display name — stable across rebrands
