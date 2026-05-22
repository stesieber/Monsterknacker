<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Operation } from '../types/index';
import { OPERATION_LABELS, OPERATION_SYMBOL } from '../types/index';
import { useMonsters } from '../composables/useMonsters';
import CreatureCard from './CreatureCard.vue';

const props = defineProps<{
  initialOperation?: Operation;
}>();

const emit = defineEmits<{ back: [] }>();

const { heroesFor, mulHeroCount, divHeroCount } = useMonsters();

const activeTab = ref<Operation>(
  props.initialOperation ?? (divHeroCount.value > mulHeroCount.value ? 'div' : 'mul'),
);

const tabHeroes = computed(() => heroesFor(activeTab.value));
const tabGold = computed(() => tabHeroes.value.filter((e) => e.kind === 'gold'));
const tabSilver = computed(() => tabHeroes.value.filter((e) => e.kind === 'silver'));
const tabTotal = computed(() => tabHeroes.value.length);
const overallTotal = computed(() => mulHeroCount.value + divHeroCount.value);
</script>

<template>
  <div class="heroes-screen">
    <header class="screen-header">
      <button class="back-btn" type="button" @click="emit('back')" aria-label="Zurück">
        ← Zurück
      </button>
      <div class="screen-title-group">
        <h1 class="screen-title">Meine Helden</h1>
        <p v-if="tabTotal > 0" class="screen-subtitle">
          {{ tabGold.length }} Gold · {{ tabSilver.length }} Silber
        </p>
      </div>
    </header>

    <div class="tabs" role="tablist">
      <button
        type="button"
        role="tab"
        class="tab"
        :class="{ 'is-active': activeTab === 'mul' }"
        :aria-selected="activeTab === 'mul'"
        @click="activeTab = 'mul'"
      >
        <span class="tab-symbol">{{ OPERATION_SYMBOL.mul }}</span>
        <span class="tab-label">{{ OPERATION_LABELS.mul }}</span>
        <span class="tab-count">{{ mulHeroCount }}</span>
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        :class="{ 'is-active': activeTab === 'div' }"
        :aria-selected="activeTab === 'div'"
        @click="activeTab = 'div'"
      >
        <span class="tab-symbol">{{ OPERATION_SYMBOL.div }}</span>
        <span class="tab-label">{{ OPERATION_LABELS.div }}</span>
        <span class="tab-count">{{ divHeroCount }}</span>
      </button>
    </div>

    <main class="heroes-main">
      <div v-if="overallTotal === 0" class="empty-state">
        <p class="empty-text">Du hast noch keine Helden —</p>
        <p class="empty-hint">übe weiter, dann schaffst du es!</p>
      </div>

      <div v-else-if="tabTotal === 0" class="empty-state">
        <p class="empty-text">Hier sind noch keine Helden.</p>
        <p class="empty-hint">Wechsle den Tab oder übe weiter!</p>
      </div>

      <template v-else>
        <section v-if="tabGold.length > 0" class="hero-section hero-section--gold">
          <div class="section-header">
            <span class="section-label">Goldhelden</span>
            <span class="section-count">{{ tabGold.length }}</span>
          </div>
          <div class="creature-grid">
            <CreatureCard
              v-for="entry in tabGold"
              :key="entry.taskId"
              :entry="entry"
            />
          </div>
        </section>

        <section v-if="tabSilver.length > 0" class="hero-section hero-section--silver">
          <div class="section-header">
            <span class="section-label">Silberhelden</span>
            <span class="section-count">{{ tabSilver.length }}</span>
          </div>
          <div class="creature-grid">
            <CreatureCard
              v-for="entry in tabSilver"
              :key="entry.taskId"
              :entry="entry"
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.heroes-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 700px;
  margin: 0 auto;
  padding: 0 16px 40px;
}

.screen-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  position: sticky;
  top: 0;
  background: var(--color-bg);
  z-index: 10;
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
  white-space: nowrap;
  transition: background 0.15s;
}

.back-btn:hover {
  background: #e8eaf0;
}

.screen-title-group {
  flex: 1;
}

.screen-title {
  font-size: clamp(1.2rem, 4vw, 1.6rem);
  font-weight: 800;
  color: var(--color-text);
}

.screen-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.tab {
  flex: 1;
  min-height: 56px;
  border-radius: 999px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.tab.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.tab-symbol {
  font-size: 1.2rem;
  font-weight: 900;
  line-height: 1;
}

.tab-count {
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 8px;
  border-radius: 999px;
}

.tab.is-active .tab-count {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.heroes-main {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.empty-hint {
  font-size: 1rem;
  color: var(--color-text-muted);
}

.hero-section {
  margin-bottom: 32px;
  border-left: 4px solid var(--section-accent, var(--color-primary));
  padding-left: 14px;
}

.hero-section--gold {
  --section-accent: var(--color-gold);
}

.hero-section--silver {
  --section-accent: var(--color-silver);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.section-label {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
}

.section-count {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-muted);
  background: var(--color-bg);
  padding: 1px 8px;
  border-radius: 20px;
}

.creature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

@media (min-width: 600px) {
  .creature-grid {
    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  }
}

@media (max-width: 400px) {
  .tab-label {
    display: none;
  }
}
</style>
