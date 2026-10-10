import { Gender } from './types';

export interface LookbookEntry {
  id: string;
  timestamp: number;
  gender: Gender;
  itemIds: string[];
  sceneId: string;
  summary: string;
  remixLevel: number;
  title?: string;
  imageData?: string; // base64 PNG data URL (data:image/png;base64,...)
}

export const DB_NAME = 'vietmix_db';
export const DB_VERSION = 1;
export const STORE_NAME = 'lookbook_album';
export const LEGACY_STORAGE_KEY = 'vietmix_lookbook_v1';

let cachedDb: IDBDatabase | null = null;
let migrationPerformed = false;

/**
 * Checks if browser storage (IndexedDB or localStorage) is available.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return typeof window.indexedDB !== 'undefined' || typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Converts a Blob or File to a base64 Data URL.
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof FileReader === 'undefined') {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts a base64 Data URL to a File object for sharing or downloading.
 */
export function dataUrlToFile(
  dataUrl: string,
  filename: string = `viet-phuc-remix-${Date.now()}.png`
): File | null {
  if (typeof window === 'undefined') return null;
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch {
    return null;
  }
}

/**
 * Downloads a data URL as a file on the user's device.
 */
export function downloadDataUrl(
  dataUrl: string,
  filename: string = `viet-phuc-remix-${Date.now()}.png`
): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads legacy entries saved previously in localStorage.
 */
export function getLegacyLookbook(): LookbookEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

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
    return [];
  }
}

/**
 * Synchronously writes a lightweight metadata entry to localStorage.
 */
export function saveLegacyLookbookSync(entry: LookbookEntry): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getLegacyLookbook();
    const stripped: LookbookEntry = { ...entry, imageData: undefined };
    const updated = [stripped, ...existing.filter((e) => e.id !== entry.id)].slice(0, 50);
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Opens or initializes the IndexedDB database.
 */
export function openLookbookDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('gender', 'gender', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        cachedDb = (event.target as IDBOpenDBRequest).result;
        cachedDb.onclose = () => {
          cachedDb = null;
        };
        resolve(cachedDb);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Resets migration state (useful for tests or re-sync).
 */
export function resetMigrationState(): void {
  migrationPerformed = false;
}

/**
 * Migrates previously saved localStorage outfits into IndexedDB so no existing outfits are lost.
 */
export async function migrateLegacyStorage(force: boolean = false): Promise<number> {
  if ((migrationPerformed && !force) || typeof window === 'undefined') return 0;
  migrationPerformed = true;

  const legacy = getLegacyLookbook();
  if (legacy.length === 0) return 0;

  const db = await openLookbookDb();
  if (!db) return 0;

  let count = 0;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const existingEntries: LookbookEntry[] = getAllReq.result || [];
        const existingIds = new Set(existingEntries.map((e) => e.id));

        for (const item of legacy) {
          if (!existingIds.has(item.id)) {
            store.put(item);
            count++;
          }
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });

  return count;
}

/**
 * Retrieves all Lookbook entries sorted chronologically (newest first).
 */
export async function getLookbook(): Promise<LookbookEntry[]> {
  if (typeof window === 'undefined') return [];

  if (typeof window !== 'undefined' && window.location?.search?.includes('demo=1')) {
    try {
      await seedDemoOutfitsIfRequested();
    } catch {
      // ignore
    }
  }

  // 1. Try to migrate any old localStorage entries on first read
  try {
    await migrateLegacyStorage();
  } catch {
    // ignore migration error
  }

  // 2. Query IndexedDB
  const db = await openLookbookDb();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const list: LookbookEntry[] = req.result || [];
          // Sort newest first
          list.sort((a, b) => b.timestamp - a.timestamp);
          resolve(list);
        };

        req.onerror = () => {
          // Fallback to legacy storage
          resolve(getLegacyLookbook());
        };
      } catch {
        resolve(getLegacyLookbook());
      }
    });
  }

  // Fallback to legacy storage if IndexedDB is unavailable
  return getLegacyLookbook();
}

/**
 * Saves an outfit to the Lookbook Album in IndexedDB.
 */
export async function saveToLookbook(
  entryData: Omit<LookbookEntry, 'id' | 'timestamp'> & {
    id?: string;
    timestamp?: number;
  }
): Promise<LookbookEntry | null> {
  if (typeof window === 'undefined') return null;

  const id = entryData.id || `lookbook_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = entryData.timestamp || Date.now();

  const newEntry: LookbookEntry = {
    ...entryData,
    id,
    timestamp,
  };

  const db = await openLookbookDb();
  if (db) {
    const success = await new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(newEntry);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch {
        resolve(false);
      }
    });

    if (success) {
      // Also update a lightweight metadata mirror in localStorage (without large base64 imageData)
      try {
        const existing = getLegacyLookbook();
        const stripped: LookbookEntry = { ...newEntry, imageData: undefined };
        const updated = [stripped, ...existing.filter((e) => e.id !== id)].slice(0, 50);
        window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage quota warnings
      }
      return newEntry;
    }
  }

  // Fallback: save to localStorage if IndexedDB failed
  try {
    const existing = getLegacyLookbook();
    const stripped: LookbookEntry = { ...newEntry, imageData: undefined };
    const updated = [stripped, ...existing.filter((e) => e.id !== id)].slice(0, 50);
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch {
    return null;
  }
}

/**
 * Deletes an entry from Lookbook Album in IndexedDB.
 */
export async function deleteFromLookbook(id: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  let idbSuccess = false;
  const db = await openLookbookDb();
  if (db) {
    idbSuccess = await new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  // Also remove from legacy localStorage
  try {
    const existing = getLegacyLookbook();
    const updated = existing.filter((item) => item.id !== id);
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return idbSuccess || true;
}

/**
 * Clears all entries from the Lookbook Album.
 */
export async function clearLookbook(): Promise<void> {
  migrationPerformed = false;
  if (typeof window === 'undefined') return;

  const db = await openLookbookDb();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Seeds the 3 curated demo outfits into IndexedDB without overwriting or deleting any personal user data.
 */
export async function seedDemoOutfitsIfRequested(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  const db = await openLookbookDb();
  if (!db) return 0;

  // Import lazily to avoid circular references
  const { DEMO_SAMPLE_LOOKS } = await import('./demoData');

  let added = 0;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const existing: LookbookEntry[] = req.result || [];
        const existingIds = new Set(existing.map((e) => e.id));

        for (const sample of DEMO_SAMPLE_LOOKS) {
          if (!existingIds.has(sample.id)) {
            store.put(sample);
            added++;
          }
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });

  return added;
}

if (typeof window !== 'undefined') {
  (window as any).seedVietmixDemo = seedDemoOutfitsIfRequested;
}
