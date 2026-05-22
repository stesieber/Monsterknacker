<script setup lang="ts">
import { ref } from 'vue';
import { useProfiles } from '../composables/useProfiles';
import { useMonsters } from '../composables/useMonsters';
import { OPERATION_SYMBOL } from '../types/index';
import ProfileEditDialog from './ProfileEditDialog.vue';
import MonsterSvg1 from './MonsterSvg1.vue';

const emit = defineEmits<{
  switchProfile: [];
  startPractice: [];
  showMonsters: [];
  showHeroes: [];
}>();

const { activeProfile, clearActiveProfile } = useProfiles();
const {
  monsterCount,
  heroCount,
  mulMonsterCount,
  divMonsterCount,
  mulHeroCount,
  divHeroCount,
} = useMonsters();
const showSettings = ref(false);

function switchProfile() {
  clearActiveProfile();
  emit('switchProfile');
}
</script>

<template>
  <div class="home">
    <header class="home-header">
      <div class="home-greeting">
        <span class="home-emoji" aria-hidden="true">{{ activeProfile?.emoji }}</span>
        <h1 class="home-title">Hallo, {{ activeProfile?.name }}!</h1>
      </div>
      <div class="home-actions">
        <button class="icon-btn" type="button" aria-label="Einstellungen" @click="showSettings = true">
          ⚙️
        </button>
        <button class="switch-btn" type="button" @click="switchProfile">Profil wechseln</button>
      </div>
    </header>

    <main class="home-main">
      <!-- Monster & Hero tiles -->
      <div class="creature-tiles">
        <button class="creature-tile creature-tile--monster" type="button" @click="emit('showMonsters')">
          <div class="tile-icon">
            <MonsterSvg1 tone="monster" />
          </div>
          <div class="tile-content">
            <span class="tile-count">{{ monsterCount }}</span>
            <span class="tile-label">{{ monsterCount === 0 ? 'Alles besiegt!' : 'Monster' }}</span>
            <span v-if="monsterCount > 0" class="tile-split">
              <span class="split-part">{{ OPERATION_SYMBOL.mul }} {{ mulMonsterCount }}</span>
              <span class="split-sep">·</span>
              <span class="split-part">{{ OPERATION_SYMBOL.div }} {{ divMonsterCount }}</span>
            </span>
          </div>
        </button>

        <button class="creature-tile creature-tile--hero" type="button" @click="emit('showHeroes')">
          <div class="tile-icon">
            <MonsterSvg1 tone="gold" />
          </div>
          <div class="tile-content">
            <span class="tile-count">{{ heroCount }}</span>
            <span class="tile-label">{{ heroCount === 0 ? 'Los geht\'s!' : 'Helden' }}</span>
            <span v-if="heroCount > 0" class="tile-split">
              <span class="split-part">{{ OPERATION_SYMBOL.mul }} {{ mulHeroCount }}</span>
              <span class="split-sep">·</span>
              <span class="split-part">{{ OPERATION_SYMBOL.div }} {{ divHeroCount }}</span>
            </span>
          </div>
        </button>
      </div>

      <button class="practice-btn" type="button" @click="emit('startPractice')">
        Üben starten
      </button>
    </main>
  </div>

  <ProfileEditDialog
    v-if="showSettings && activeProfile"
    mode="edit"
    :profile="activeProfile"
    @close="showSettings = false"
  />
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.home-greeting {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-emoji {
  font-size: 2.4rem;
  line-height: 1;
}

.home-title {
  font-size: clamp(1.4rem, 4vw, 2rem);
  font-weight: 800;
  color: var(--color-text);
}

.home-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.icon-btn:hover {
  background: #e8eaf0;
}

.switch-btn {
  padding: 10px 18px;
  border-radius: 10px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
  min-height: 44px;
  transition: background 0.15s;
}

.switch-btn:hover {
  background: #e8eaf0;
}

.home-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  justify-content: center;
}

.creature-tiles {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 360px;
}

.creature-tile {
  flex: 1;
  min-height: 100px;
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  transition: background 0.15s, transform 0.1s;
  text-align: left;
}

.creature-tile:hover {
  background: #f0f2f8;
}

.creature-tile:active {
  transform: scale(0.97);
}

.tile-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.tile-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.tile-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tile-count {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-text);
}

.tile-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.tile-split {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.split-part {
  white-space: nowrap;
}

.split-sep {
  opacity: 0.5;
}

.practice-btn {
  width: 100%;
  max-width: 360px;
  min-height: 72px;
  border-radius: var(--radius);
  background: var(--color-primary);
  color: #fff;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 16px rgba(91, 108, 255, 0.35);
  transition: background 0.15s, transform 0.1s;
}

.practice-btn:hover {
  background: var(--color-primary-dark);
}

.practice-btn:active {
  transform: scale(0.97);
}
</style>
