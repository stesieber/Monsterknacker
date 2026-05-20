<script setup lang="ts">
import { ref } from 'vue';
import { useProfiles } from './composables/useProfiles';
import ProfileSelector from './components/ProfileSelector.vue';
import HomeScreen from './components/HomeScreen.vue';
import PracticeSession from './components/PracticeSession.vue';

type Screen = 'profile-selector' | 'home' | 'practice';

const currentScreen = ref<Screen>('profile-selector');
const { activeProfile } = useProfiles();

function goToPractice() {
  if (!activeProfile.value) return;
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
    @start-practice="goToPractice"
  />
  <PracticeSession
    v-else
    @exit="goToHome"
  />
</template>
