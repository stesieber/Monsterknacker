import type { AppData } from '../types/index';

const STORAGE_KEY = 'monsterknacker';
const CURRENT_VERSION = 1;

const DEFAULT_APP_DATA: AppData = {
  version: CURRENT_VERSION,
  activeProfileId: null,
  profiles: [],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrate(_data: any, _fromVersion: number): AppData {
  // Migration stub — will be filled in later iterations
  return { ...DEFAULT_APP_DATA };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_DATA };

    const parsed = JSON.parse(raw) as AppData;

    if (parsed.version !== CURRENT_VERSION) {
      console.warn(`[Monsterknacker] Storage version mismatch (${parsed.version} → ${CURRENT_VERSION}), migrating.`);
      return migrate(parsed, parsed.version);
    }

    return parsed;
  } catch (err) {
    console.warn('[Monsterknacker] Failed to load storage, using defaults.', err);
    return { ...DEFAULT_APP_DATA };
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[Monsterknacker] Failed to save storage (QuotaExceededError?).', err);
  }
}
