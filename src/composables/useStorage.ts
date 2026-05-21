import type { AppData } from '../types/index';
import { SMALL_TABLE_TASK_IDS } from '../types/index';

const STORAGE_KEY = 'monsterknacker';
const CURRENT_VERSION = 2;

const DEFAULT_APP_DATA: AppData = {
  version: CURRENT_VERSION,
  activeProfileId: null,
  profiles: [],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateV1toV2(data: any): any {
  for (const profile of data.profiles ?? []) {
    if (!profile.tasks) profile.tasks = {};
    for (const id of SMALL_TABLE_TASK_IDS) {
      const existing = profile.tasks[id];
      if (!existing) {
        profile.tasks[id] = { attempts: 0, correct: 0, box: 1 };
      } else if (existing.box === undefined) {
        existing.box = 1;
      }
    }
  }
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrate(data: any, fromVersion: number): AppData {
  let migrated = data;
  if (fromVersion < 2) migrated = migrateV1toV2(migrated);
  migrated.version = CURRENT_VERSION;
  return migrated as AppData;
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_DATA };

    const parsed = JSON.parse(raw) as AppData;

    if (parsed.version < CURRENT_VERSION) {
      console.warn(`[Monsterknacker] Storage v${parsed.version} → v${CURRENT_VERSION}, migrating.`);
      const migrated = migrate(parsed, parsed.version);
      saveAppData(migrated);
      return migrated;
    }

    if (parsed.version > CURRENT_VERSION) {
      console.warn('[Monsterknacker] Storage version newer than app, using defaults.');
      return { ...DEFAULT_APP_DATA };
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
