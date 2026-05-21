<script setup lang="ts">
import { computed } from 'vue';
import { useMonsters } from '../composables/useMonsters';
import CreatureCard from './CreatureCard.vue';

const emit = defineEmits<{ back: [] }>();

const { heroes, heroCount, silverCount, goldCount } = useMonsters();

const goldHeroes = computed(() => heroes.value.filter((e) => e.kind === 'gold'));
const silverHeroes = computed(() => heroes.value.filter((e) => e.kind === 'silver'));
</script>

<template>
  <div class="heroes-screen">
    <header class="screen-header">
      <button class="back-btn" type="button" @click="emit('back')" aria-label="Zurück">
        ← Zurück
      </button>
      <div class="screen-title-group">
        <h1 class="screen-title">Meine Helden</h1>
        <p v-if="heroCount > 0" class="screen-subtitle">
          {{ goldCount }} Gold · {{ silverCount }} Silber
        </p>
      </div>
    </header>

    <main class="heroes-main">
      <div v-if="heroCount === 0" class="empty-state">
        <p class="empty-text">Du hast noch keine Helden —</p>
        <p class="empty-hint">übe weiter, dann schaffst du es!</p>
      </div>

      <template v-else>
        <section v-if="goldHeroes.length > 0" class="hero-section hero-section--gold">
          <div class="section-header">
            <span class="section-label">Goldhelden</span>
            <span class="section-count">{{ goldCount }}</span>
          </div>
          <div class="creature-grid">
            <CreatureCard
              v-for="entry in goldHeroes"
              :key="entry.taskId"
              :entry="entry"
            />
          </div>
        </section>

        <section v-if="silverHeroes.length > 0" class="hero-section hero-section--silver">
          <div class="section-header">
            <span class="section-label">Silberhelden</span>
            <span class="section-count">{{ silverCount }}</span>
          </div>
          <div class="creature-grid">
            <CreatureCard
              v-for="entry in silverHeroes"
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

.heroes-main {
  flex: 1;
  padding-top: 8px;
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
</style>
