<script setup lang="ts">
import { computed } from 'vue';
import { useStats } from '../composables/useStats';
import { useMonsters } from '../composables/useMonsters';
import { formatMs } from '../utils/time';
import StatTile from './StatTile.vue';
import LeitnerBarChart from './LeitnerBarChart.vue';
import TopTaskList from './TopTaskList.vue';

const emit = defineEmits<{ back: [] }>();

const { leitnerDistribution, solvedCount, lifetimeMs, strongestTasks, weakestTasks, totalAttempts } = useStats();
const { monsterCount, heroCount } = useMonsters();

const lifetimeFormatted = computed(() => formatMs(lifetimeMs.value));
const hasAnyAttempts = computed(() => totalAttempts.value > 0);
</script>

<template>
  <div class="stats-screen">
    <header class="stats-header">
      <button class="stats-back-btn" type="button" aria-label="Zurück zur Startseite" @click="emit('back')">
        ← Zurück
      </button>
      <h1 class="stats-title">Deine Fortschritte</h1>
    </header>

    <main class="stats-main">
      <!-- Stat tiles -->
      <div class="stat-tiles-grid">
        <StatTile label="Gelöste Aufgaben" :value="solvedCount" icon="✅" />
        <StatTile label="Übungszeit" :value="lifetimeFormatted" icon="⏱" />
        <StatTile label="Monster" :value="monsterCount" icon="👾" />
        <StatTile label="Helden" :value="heroCount" icon="⭐" />
      </div>

      <!-- Leitner bar chart -->
      <section class="stats-section">
        <h2 class="stats-section-title">Aufgaben-Verteilung</h2>
        <LeitnerBarChart :distribution="leitnerDistribution" />
      </section>

      <!-- Empty state hint -->
      <p v-if="!hasAnyAttempts" class="stats-empty-hint">
        Hier siehst du bald deinen Fortschritt — leg los und besiege ein paar Monster! 🚀
      </p>

      <!-- Strongest tasks -->
      <TopTaskList title="Stärkste Aufgaben" :entries="strongestTasks" />

      <!-- Weakest tasks -->
      <TopTaskList title="Übe diese noch" :entries="weakestTasks" />
    </main>
  </div>
</template>

<style scoped>
.stats-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px 48px;
}

.stats-header {
  position: sticky;
  top: 0;
  background: var(--color-bg);
  padding: 16px 0 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-back-btn {
  min-height: 44px;
  min-width: 44px;
  padding: 8px 16px;
  border-radius: 10px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text);
  transition: background 0.15s;
  flex-shrink: 0;
}

.stats-back-btn:hover {
  background: #e8eaf0;
}

.stats-title {
  font-size: clamp(1.2rem, 4vw, 1.6rem);
  font-weight: 800;
  color: var(--color-text);
}

.stats-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 8px;
}

.stat-tiles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (min-width: 600px) {
  .stat-tiles-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-section-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
}

.stats-empty-hint {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: var(--shadow);
  text-align: center;
  line-height: 1.6;
}
</style>
