<script setup lang="ts">
import { ref } from 'vue';
import ProfileSelector from './components/ProfileSelector.vue';
import HomeScreen from './components/HomeScreen.vue';

type Screen = 'profile-selector' | 'home';

const currentScreen = ref<Screen>('profile-selector');
</script>

<template>
  <ProfileSelector
    v-if="currentScreen === 'profile-selector'"
    @profile-selected="currentScreen = 'home'"
  />
  <HomeScreen
    v-else
    @switch-profile="currentScreen = 'profile-selector'"
  />
</template>
