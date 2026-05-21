import type { AppData } from '../types/index';
import { SMALL_TABLE_TASK_IDS } from '../types/index';
import { randomMonsterType } from '../utils/creature';

const STORAGE_KEY = 'monsterknacker';
const CURRENT_VERSION = 4;

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
function migrateV2toV3(data: any): any {
  // updateLastSessionConfig (Iter. 3) incorrectly initialized showVisualization: false.
  // Any profile with showVisualization===false got it from that bug, not from user intent
  // (the toggle UI didn't exist before Iter. 5). Reset to true.
  for (const profile of data.profiles ?? []) {
    if (profile.settings?.showVisualization === false) {
      profile.settings.showVisualization = true;
    }
  }
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateV3toV4(data: any): any {
  for (const profile of data.profiles ?? []) {
    if (!profile.tasks) continue;
    for (const taskId of Object.keys(profile.tasks)) {
      const t = profile.tasks[taskId];
      if (t.monsterType === undefined) {
        t.monsterType = randomMonsterType();
      }
    }
  }
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrate(data: any, fromVersion: number): AppData {
  let migrated = data;
  if (fromVersion < 2) migrated = migrateV1toV2(migrated);
  if (fromVersion < 3) migrated = migrateV2toV3(migrated);
  if (fromVersion < 4) migrated = migrateV3toV4(migrated);
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
