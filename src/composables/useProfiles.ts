import { computed, reactive, watch } from 'vue';
import type {
  AppData,
  Profile,
  ProfileSettings,
  ProfileStats,
  SessionMode,
  Difficulty,
  Operation,
  Range,
  LeitnerBox,
  AttemptResult,
} from '../types/index';
import { AVAILABLE_EMOJIS } from '../types/index';
import type { TaskMap } from '../types/index';
import { loadAppData, saveAppData } from './useStorage';
import { nextBox } from '../utils/leitner';
import { allMulTaskIds, allDivTaskIds } from '../utils/task';
import { randomMonsterType, kindForBox } from '../utils/creature';

// Module-level singleton state shared across all callers
const state = reactive<AppData>(loadAppData());

watch(state, () => saveAppData(state), { deep: true });

function initializeProfileTasks(profileId: string): void {
  const profile = state.profiles.find((p) => p.id === profileId);
  if (!profile) return;
  if (!profile.tasks) profile.tasks = {} as TaskMap;
  for (const id of allMulTaskIds()) {
    if (!profile.tasks[id]) {
      profile.tasks[id] = { attempts: 0, correct: 0, box: 1, monsterType: randomMonsterType() };
    }
  }
  for (const id of allDivTaskIds()) {
    if (!profile.tasks[id]) {
      profile.tasks[id] = { attempts: 0, correct: 0, box: 1, monsterType: randomMonsterType() };
    }
  }
}

export function useProfiles() {
  const profiles = computed(() => state.profiles);

  const activeProfile = computed(() =>
    state.activeProfileId
      ? (state.profiles.find((p) => p.id === state.activeProfileId) ?? null)
      : null
  );

  function createProfile(name: string, emoji: string): Profile {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 20) {
      throw new Error('Name muss zwischen 1 und 20 Zeichen lang sein.');
    }
    if (!(AVAILABLE_EMOJIS as readonly string[]).includes(emoji)) {
      throw new Error('Ungültiges Emoji.');
    }
    const profile: Profile = {
      id: crypto.randomUUID(),
      name: trimmed,
      emoji,
      createdAt: Date.now(),
      settings: { showVisualization: true },
    };
    state.profiles.push(profile);
    initializeProfileTasks(profile.id);
    return profile;
  }

  function selectProfile(id: string): void {
    state.activeProfileId = id;
  }

  function renameProfile(id: string, newName: string): void {
    const trimmed = newName.trim();
    if (trimmed.length === 0 || trimmed.length > 20) {
      throw new Error('Name muss zwischen 1 und 20 Zeichen lang sein.');
    }
    const profile = state.profiles.find((p) => p.id === id);
    if (profile) profile.name = trimmed;
  }

  function updateEmoji(id: string, newEmoji: string): void {
    if (!(AVAILABLE_EMOJIS as readonly string[]).includes(newEmoji)) {
      throw new Error('Ungültiges Emoji.');
    }
    const profile = state.profiles.find((p) => p.id === id);
    if (profile) profile.emoji = newEmoji;
  }

  function deleteProfile(id: string): void {
    const index = state.profiles.findIndex((p) => p.id === id);
    if (index !== -1) state.profiles.splice(index, 1);
    if (state.activeProfileId === id) state.activeProfileId = null;
  }

  function clearActiveProfile(): void {
    state.activeProfileId = null;
  }

  function recordTaskAttempt(taskId: string, isCorrect: boolean): AttemptResult {
    const profile = state.profiles.find((p) => p.id === state.activeProfileId);
    if (!profile) {
      console.warn('[Monsterknacker] recordTaskAttempt: no active profile');
      return { previousKind: 'monster', newKind: 'monster', promotedToHero: false };
    }
    if (!profile.tasks) profile.tasks = {} as TaskMap;
    const existing = profile.tasks[taskId];
    if (existing) {
      const previousKind = kindForBox(existing.box);
      existing.attempts++;
      if (isCorrect) existing.correct++;
      existing.lastAttemptAt = Date.now();
      existing.box = nextBox(existing.box, isCorrect);
      const newKind = kindForBox(existing.box);
      const promotedToHero = newKind !== previousKind && newKind !== 'monster';
      return { previousKind, newKind, promotedToHero };
    } else {
      const newBox = nextBox(1 as LeitnerBox, isCorrect);
      profile.tasks[taskId] = {
        attempts: 1,
        correct: isCorrect ? 1 : 0,
        lastAttemptAt: Date.now(),
        box: newBox,
        monsterType: randomMonsterType(),
      };
      const newKind = kindForBox(newBox);
      return { previousKind: 'monster', newKind, promotedToHero: false };
    }
  }

  function addPracticeTimeMs(deltaMs: number): void {
    const profile = state.profiles.find((p) => p.id === state.activeProfileId);
    if (!profile) return;
    if (!profile.stats) {
      profile.stats = { totalPracticeMs: 0 } as ProfileStats;
    }
    profile.stats.totalPracticeMs += deltaMs;
  }

  function updateLastSessionConfig(
    mode: SessionMode,
    difficulty: Difficulty | undefined,
    operation: Operation,
    range: Range,
  ): void {
    const profile = state.profiles.find((p) => p.id === state.activeProfileId);
    if (!profile) return;
    if (!profile.settings) {
      profile.settings = { showVisualization: true };
    }
    profile.settings.lastSessionMode = mode;
    profile.settings.lastSessionDifficulty = difficulty;
    profile.settings.lastSessionOperation = operation;
    profile.settings.lastSessionRange = range;
  }

  function updateSettings(id: string, partial: Partial<ProfileSettings>): void {
    const profile = state.profiles.find((p) => p.id === id);
    if (!profile) return;
    if (!profile.settings) {
      profile.settings = { showVisualization: true };
    }
    Object.assign(profile.settings, partial);
  }

  function registerSessionEnd(taskCount: number): void {
    const profile = state.profiles.find((p) => p.id === state.activeProfileId);
    if (!profile) {
      console.warn('[Monsterknacker] registerSessionEnd: no active profile');
      return;
    }
    if (!profile.stats) {
      profile.stats = { totalPracticeMs: 0 };
    }
    if (taskCount > 0) {
      profile.stats.sessionsCount = (profile.stats.sessionsCount ?? 0) + 1;
    }
    profile.stats.lastSessionAt = Date.now();
  }

  return {
    profiles,
    activeProfile,
    createProfile,
    selectProfile,
    renameProfile,
    updateEmoji,
    deleteProfile,
    clearActiveProfile,
    recordTaskAttempt,
    addPracticeTimeMs,
    updateLastSessionConfig,
    updateSettings,
    registerSessionEnd,
  };
}
