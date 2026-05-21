<script setup lang="ts">
import { ref } from 'vue';
import { useProfiles } from '../composables/useProfiles';
import ProfileEditDialog from './ProfileEditDialog.vue';

const emit = defineEmits<{ switchProfile: []; startPractice: [] }>();

const { activeProfile, clearActiveProfile } = useProfiles();
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
  margin-bottom: 40px;
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
  align-items: center;
  justify-content: center;
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
