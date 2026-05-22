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

const { mulMonsterCount, divMonsterCount, monstersByBoxFor } = useMonsters();

const activeTab = ref<Operation>(
  props.initialOperation ?? (divMonsterCount.value > mulMonsterCount.value ? 'div' : 'mul')
);

const monstersByBox = computed(() => monstersByBoxFor(activeTab.value));
const totalForTab = computed(
  () => monstersByBox.value[1].length + monstersByBox.value[2].length + monstersByBox.value[3].length,
);

const sections = [
  {
    box: 3 as const,
    label: 'Fast Helden',
    subtitle: 'Noch eine Antwort bis zum Silberhelden!',
    accent: '#748ffc',
  },
  {
    box: 2 as const,
    label: 'In Übung',
    subtitle: 'Schon fast vertraut.',
    accent: '#51cf66',
  },
  {
    box: 1 as const,
    label: 'Neue Monster',
    subtitle: 'Hier liegt die meiste Arbeit.',
    accent: '#ff6b6b',
  },
] as const;
</script>

<template>
  <div class="monsters-screen">
    <header class="screen-header">
      <button class="back-btn" type="button" @click="emit('back')" aria-label="Zurück">
        ← Zurück
      </button>
      <div class="screen-title-group">
        <h1 class="screen-title">Meine Monster</h1>
        <p v-if="totalForTab > 0" class="screen-subtitle">{{ totalForTab }} Monster zu besiegen</p>
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
        <span class="tab-count">{{ mulMonsterCount }}</span>
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
        <span class="tab-count">{{ divMonsterCount }}</span>
      </button>
    </div>

    <main class="monsters-main">
      <div v-if="mulMonsterCount === 0 && divMonsterCount === 0" class="empty-state">
        <p class="empty-icon">🎉</p>
        <p class="empty-text">Alle besiegt!</p>
        <p class="empty-hint">Schau bei deinen Helden vorbei.</p>
      </div>

      <div v-else-if="totalForTab === 0" class="empty-state">
        <p class="empty-icon">🎉</p>
        <p class="empty-text">Hier sind keine Monster mehr!</p>
        <p class="empty-hint">Wechsle den Tab oder schau bei deinen Helden vorbei.</p>
      </div>

      <template v-else>
        <section
          v-for="s in sections"
          :key="s.box"
          v-show="monstersByBox[s.box].length > 0"
          class="box-section"
          :style="{ '--accent': s.accent }"
        >
          <div class="box-header">
            <span class="box-label">{{ s.label }}</span>
            <span class="box-count">{{ monstersByBox[s.box].length }}</span>
          </div>
          <p class="box-subtitle">{{ s.subtitle }}</p>
          <div class="creature-grid">
            <CreatureCard
              v-for="entry in monstersByBox[s.box]"
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
.monsters-screen {
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

.monsters-main {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
}

.empty-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text);
}

.empty-hint {
  font-size: 1rem;
  color: var(--color-text-muted);
}

.box-section {
  margin-bottom: 32px;
  border-left: 4px solid var(--accent);
  padding-left: 14px;
}

.box-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.box-label {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
}

.box-count {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-muted);
  background: var(--color-bg);
  padding: 1px 8px;
  border-radius: 20px;
}

.box-subtitle {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-bottom: 10px;
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
