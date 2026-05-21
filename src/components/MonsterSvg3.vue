<script setup lang="ts">
import { computed } from 'vue';

type Tone = 'monster' | 'silver' | 'gold';
const props = withDefaults(defineProps<{ tone?: Tone }>(), { tone: 'monster' });

const body = computed(() =>
  props.tone === 'gold' ? '#f5c542' : props.tone === 'silver' ? '#c0c5cf' : '#748ffc'
);
const dark = computed(() =>
  props.tone === 'gold' ? '#c89a10' : props.tone === 'silver' ? '#8c95a8' : '#4a60d0'
);
const heroShine = computed(() => (props.tone === 'gold' ? '#fff3a8' : '#e7ebf2'));
</script>

<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- Tentacles -->
    <path
      d="M28,68 Q18,78 22,90"
      :stroke="dark"
      stroke-width="5"
      fill="none"
      stroke-linecap="round"
    />
    <path
      d="M38,72 Q32,84 36,95"
      :stroke="dark"
      stroke-width="5"
      fill="none"
      stroke-linecap="round"
    />
    <path
      d="M62,72 Q68,84 64,95"
      :stroke="dark"
      stroke-width="5"
      fill="none"
      stroke-linecap="round"
    />
    <path
      d="M72,68 Q82,78 78,90"
      :stroke="dark"
      stroke-width="5"
      fill="none"
      stroke-linecap="round"
    />
    <!-- Body -->
    <ellipse cx="50" cy="52" rx="34" ry="28" :fill="body" />
    <!-- Three eyes -->
    <circle cx="34" cy="48" r="7" fill="white" />
    <circle cx="50" cy="44" r="8" fill="white" />
    <circle cx="66" cy="48" r="7" fill="white" />
    <!-- Pupils -->
    <circle cx="35" cy="48" r="4" fill="#1f2433" />
    <circle cx="51" cy="44" r="4.5" fill="#1f2433" />
    <circle cx="67" cy="48" r="4" fill="#1f2433" />
    <!-- Eye shines -->
    <circle cx="37" cy="46" r="1.5" fill="white" />
    <circle cx="53" cy="42" r="1.8" fill="white" />
    <circle cx="69" cy="46" r="1.5" fill="white" />
    <!-- Smile -->
    <path
      d="M39,62 Q50,70 61,62"
      :stroke="dark"
      stroke-width="2.5"
      fill="none"
      stroke-linecap="round"
    />
    <!-- Hero: halo ring -->
    <g v-if="tone !== 'monster'">
      <ellipse
        cx="50"
        cy="20"
        rx="22"
        ry="7"
        :stroke="heroShine"
        stroke-width="4"
        fill="none"
        opacity="0.9"
      />
      <ellipse
        cx="50"
        cy="20"
        rx="22"
        ry="7"
        :stroke="body"
        stroke-width="1"
        fill="none"
        opacity="0.5"
      />
    </g>
  </svg>
</template>
