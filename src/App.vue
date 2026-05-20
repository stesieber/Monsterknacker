<script setup lang="ts">
import { ref } from 'vue';
import { useProfiles } from './composables/useProfiles';
import type { SessionConfig } from './types/index';
import ProfileSelector from './components/ProfileSelector.vue';
import HomeScreen from './components/HomeScreen.vue';
import ModeSelector from './components/ModeSelector.vue';
import PracticeSession from './components/PracticeSession.vue';

type Screen = 'profile-selector' | 'home' | 'mode-selector' | 'practice';

const currentScreen = ref<Screen>('profile-selector');
const { activeProfile } = useProfiles();
const sessionConfig = ref<SessionConfig>({ mode: 'free' });

function goToModeSelector() {
  if (!activeProfile.value) return;
  currentScreen.value = 'mode-selector';
}

function startPractice(config: SessionConfig) {
  sessionConfig.value = config;
  currentScreen.value = 'practice';
}

function goToHome() {
  currentScreen.value = 'home';
}
</script>

<template>
  <ProfileSelector
    v-if="currentScreen === 'profile-selector'"
    @profile-selected="currentScreen = 'home'"
  />
  <HomeScreen
    v-else-if="currentScreen === 'home'"
    @switch-profile="currentScreen = 'profile-selector'"
    @start-practice="goToModeSelector"
  />
  <ModeSelector
    v-else-if="currentScreen === 'mode-selector'"
    @start="startPractice"
    @back="currentScreen = 'home'"
  />
  <PracticeSession
    v-else
    :config="sessionConfig"
    @exit="goToHome"
  />
</template>
