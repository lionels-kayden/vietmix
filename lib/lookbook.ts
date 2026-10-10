import { Gender } from './types';

export interface LookbookEntry {
  id: string;
  timestamp: number;
  gender: Gender;
  itemIds: string[];
  sceneId: string;
  summary: string;
  remixLevel: number;
}

const STORAGE_KEY = 'vietmix_lookbook_v1';

export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getLookbook(): LookbookEntry[] {
  if (!isStorageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter valid entries
    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry === 'object' &&
        typeof entry.id === 'string' &&
        typeof entry.timestamp === 'number' &&
        (entry.gender === 'male' || entry.gender === 'female') &&
        Array.isArray(entry.itemIds)
    );
  } catch {
    // If JSON is corrupt, fail gracefully without crashing
    return [];
  }
}

export function saveToLookbook(
  entryData: Omit<LookbookEntry, 'id' | 'timestamp'>
): LookbookEntry | null {
  if (!isStorageAvailable()) return null;

  try {
    const existing = getLookbook();
    const newEntry: LookbookEntry = {
      ...entryData,
      id: `lookbook_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    // Prepend new entry, limit to 50 outfits to preserve localStorage quota
    const updated = [newEntry, ...existing].slice(0, 50);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch {
    // QuotaExceededError or other write error
    return null;
  }
}

export function deleteFromLookbook(id: string): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const existing = getLookbook();
    const updated = existing.filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export function clearLookbook(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
