import { computed, reactive, watch } from 'vue';
import type { AppData, Profile, ProfileStats, SessionMode, Difficulty, LeitnerBox } from '../types/index';
import { AVAILABLE_EMOJIS, SMALL_TABLE_TASK_IDS } from '../types/index';
import type { TaskMap } from '../types/index';
import { loadAppData, saveAppData } from './useStorage';
import { nextBox } from '../utils/leitner';

// Module-level singleton state shared across all callers
const state = reactive<AppData>(loadAppData());

watch(state, () => saveAppData(state), { deep: true });

function initializeProfileTasks(profileId: string): void {
  const profile = state.profiles.find((p) => p.id === profileId);
  if (!profile) return;
  if (!profile.tasks) profile.tasks = {} as TaskMap;
  for (const id of SMALL_TABLE_TASK_IDS) {
    if (!profile.tasks[id]) {
      profile.tasks[id] = { attempts: 0, correct: 0, box: 1 };
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

  function recordTaskAttempt(taskId: string, isCorrect: boolean): void {
    const profile = state.profiles.find((p) => p.id === state.activeProfileId);
    if (!profile) {
      console.warn('[Monsterknacker] recordTaskAttempt: no active profile');
      return;
    }
    if (!profile.tasks) profile.tasks = {} as TaskMap;
    const existing = profile.tasks[taskId];
    if (existing) {
      existing.attempts++;
      if (isCorrect) existing.correct++;
      existing.lastAttemptAt = Date.now();
      existing.box = nextBox(existing.box, isCorrect);
    } else {
      profile.tasks[taskId] = {
        attempts: 1,
        correct: isCorrect ? 1 : 0,
        lastAttemptAt: Date.now(),
        box: nextBox(1 as LeitnerBox, isCorrect),
      };
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

  function updateLastSessionConfig(mode: SessionMode, difficulty?: Difficulty): void {
    const profile = state.profiles.find((p) => p.id === state.activeProfileId);
    if (!profile) return;
    if (!profile.settings) {
      profile.settings = { showVisualization: false };
    }
    profile.settings.lastSessionMode = mode;
    profile.settings.lastSessionDifficulty = difficulty;
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
  };
}
