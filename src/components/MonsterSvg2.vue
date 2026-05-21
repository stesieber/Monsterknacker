<script setup lang="ts">
import { computed } from 'vue';

type Tone = 'monster' | 'silver' | 'gold';
const props = withDefaults(defineProps<{ tone?: Tone }>(), { tone: 'monster' });

const body = computed(() =>
  props.tone === 'gold' ? '#f5c542' : props.tone === 'silver' ? '#c0c5cf' : '#51cf66'
);
const dark = computed(() =>
  props.tone === 'gold' ? '#c89a10' : props.tone === 'silver' ? '#8c95a8' : '#2f9e50'
);
const heroShine = computed(() => (props.tone === 'gold' ? '#fff3a8' : '#e7ebf2'));
</script>

<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- Body (rounded rect) -->
    <rect x="14" y="28" width="72" height="58" rx="14" ry="14" :fill="body" />
    <!-- Ear-like bumps on top -->
    <circle cx="26" cy="28" r="10" :fill="body" />
    <circle cx="74" cy="28" r="10" :fill="body" />
    <!-- Eyes white -->
    <circle cx="37" cy="50" r="10" fill="white" />
    <circle cx="63" cy="50" r="10" fill="white" />
    <!-- Pupils -->
    <circle cx="39" cy="50" r="5.5" fill="#1f2433" />
    <circle cx="65" cy="50" r="5.5" fill="#1f2433" />
    <!-- Eye shine -->
    <circle cx="42" cy="47" r="2" fill="white" />
    <circle cx="68" cy="47" r="2" fill="white" />
    <!-- Wide grin -->
    <rect x="30" y="65" width="40" height="14" rx="5" ry="5" :fill="dark" />
    <!-- Teeth (white bumps) -->
    <rect x="33" y="65" width="8" height="8" rx="2" fill="white" />
    <rect x="46" y="65" width="8" height="8" rx="2" fill="white" />
    <rect x="59" y="65" width="8" height="8" rx="2" fill="white" />
    <!-- Feet -->
    <ellipse cx="33" cy="86" rx="10" ry="7" :fill="dark" />
    <ellipse cx="67" cy="86" rx="10" ry="7" :fill="dark" />
    <!-- Hero: stars around head -->
    <g v-if="tone !== 'monster'">
      <polygon
        points="50,2 52,8 58,8 53,12 55,18 50,14 45,18 47,12 42,8 48,8"
        :fill="heroShine"
        :stroke="body"
        stroke-width="0.5"
      />
      <polygon
        points="20,15 21,19 25,19 22,22 23,26 20,23 17,26 18,22 15,19 19,19"
        :fill="heroShine"
        :stroke="body"
        stroke-width="0.5"
        opacity="0.8"
      />
      <polygon
        points="80,15 81,19 85,19 82,22 83,26 80,23 77,26 78,22 75,19 79,19"
        :fill="heroShine"
        :stroke="body"
        stroke-width="0.5"
        opacity="0.8"
      />
    </g>
  </svg>
</template>
