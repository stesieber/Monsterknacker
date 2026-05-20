<script setup lang="ts">
import { useProfiles } from '../composables/useProfiles';

const emit = defineEmits<{ switchProfile: []; startPractice: [] }>();

const { activeProfile, clearActiveProfile } = useProfiles();

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
      <button class="switch-btn" type="button" @click="switchProfile">Profil wechseln</button>
    </header>

    <main class="home-main">
      <button class="practice-btn" type="button" @click="emit('startPractice')">
        Üben starten
      </button>
    </main>
  </div>
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
