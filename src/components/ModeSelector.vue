<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { SessionMode, Difficulty, SessionConfig } from '../types/index';
import { DIFFICULTY_LABELS, DIFFICULTY_TIMEOUT_MS } from '../types/index';
import { useProfiles } from '../composables/useProfiles';

const emit = defineEmits<{
  start: [config: SessionConfig];
  back: [];
}>();

const { activeProfile, updateLastSessionConfig } = useProfiles();

const selectedMode = ref<SessionMode | null>(null);
const selectedDifficulty = ref<Difficulty | null>(null);

const showDifficulty = computed(() => selectedMode.value === 'training');

const canStart = computed(() => {
  if (!selectedMode.value) return false;
  if (selectedMode.value === 'training' && !selectedDifficulty.value) return false;
  return true;
});

const difficulties: { value: Difficulty; timeSeconds: number; description: string }[] = [
  { value: 'easy', timeSeconds: DIFFICULTY_TIMEOUT_MS.easy / 1000, description: 'Viel Zeit zum Überlegen' },
  { value: 'medium', timeSeconds: DIFFICULTY_TIMEOUT_MS.medium / 1000, description: 'Zügiges Tempo' },
  { value: 'expert', timeSeconds: DIFFICULTY_TIMEOUT_MS.expert / 1000, description: 'Schneller Abruf' },
];

onMounted(() => {
  const settings = activeProfile.value?.settings;
  if (settings?.lastSessionMode) {
    selectedMode.value = settings.lastSessionMode;
    if (settings.lastSessionDifficulty) {
      selectedDifficulty.value = settings.lastSessionDifficulty;
    }
  }
});

function startSession() {
  if (!canStart.value || !selectedMode.value) return;
  const config: SessionConfig = {
    mode: selectedMode.value,
    difficulty: selectedMode.value === 'training' ? (selectedDifficulty.value ?? undefined) : undefined,
  };
  updateLastSessionConfig(config.mode, config.difficulty);
  emit('start', config);
}
</script>

<template>
  <div class="mode-selector">
    <header class="mode-selector-header">
      <button class="back-btn" type="button" @click="emit('back')">← Zurück</button>
      <h1 class="mode-selector-title">Wie möchtest du üben?</h1>
    </header>

    <main class="mode-selector-main">
      <div class="mode-cards">
        <button
          class="mode-card"
          :class="{ 'is-selected': selectedMode === 'free' }"
          type="button"
          @click="selectedMode = 'free'"
        >
          <span class="mode-card-title">Freies Üben</span>
          <span class="mode-card-subtitle">Ohne Zeitdruck — übe in deinem Tempo</span>
        </button>

        <button
          class="mode-card"
          :class="{ 'is-selected': selectedMode === 'training' }"
          type="button"
          @click="selectedMode = 'training'"
        >
          <span class="mode-card-title">Training</span>
          <span class="mode-card-subtitle">Mit Stoppuhr — werde schneller</span>
        </button>
      </div>

      <div class="difficulty-section" :class="{ 'is-visible': showDifficulty }">
        <div class="difficulty-cards">
          <button
            v-for="d in difficulties"
            :key="d.value"
            class="difficulty-card"
            :class="{ 'is-selected': selectedDifficulty === d.value }"
            type="button"
            @click="selectedDifficulty = d.value"
          >
            <span class="difficulty-label">{{ DIFFICULTY_LABELS[d.value] }} ({{ d.timeSeconds }} Sek.)</span>
            <span class="difficulty-desc">{{ d.description }}</span>
          </button>
        </div>
      </div>

      <button
        class="start-btn"
        type="button"
        :disabled="!canStart"
        @click="startSession"
      >
        Los geht's!
      </button>
    </main>
  </div>
</template>

<style scoped>
.mode-selector {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.mode-selector-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
  min-height: 44px;
  flex-shrink: 0;
  transition: background 0.15s;
}

.back-btn:hover {
  background: #e8eaf0;
}

.mode-selector-title {
  font-size: clamp(1.2rem, 4vw, 1.6rem);
  font-weight: 800;
  color: var(--color-text);
}

.mode-selector-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mode-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-card {
  width: 100%;
  min-height: 100px;
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow);
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  padding: 20px 24px;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.mode-card.is-selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.mode-card-title {
  font-size: 1.2rem;
  font-weight: 800;
}

.mode-card-subtitle {
  font-size: 0.9rem;
  opacity: 0.85;
}

/* Slide-down animation for difficulty section */
.difficulty-section {
  max-height: 0;
  overflow: hidden;
  transition: max-height 200ms ease;
}

.difficulty-section.is-visible {
  max-height: 600px;
}

.difficulty-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}

.difficulty-card {
  width: 100%;
  min-height: 80px;
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow);
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  padding: 16px 20px;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.difficulty-card.is-selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.difficulty-label {
  font-size: 1rem;
  font-weight: 700;
}

.difficulty-desc {
  font-size: 0.85rem;
  opacity: 0.8;
}

.start-btn {
  width: 100%;
  min-height: 64px;
  border-radius: var(--radius);
  background: var(--color-primary);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 800;
  box-shadow: 0 4px 16px rgba(91, 108, 255, 0.35);
  transition: background 0.15s, opacity 0.15s;
}

.start-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
