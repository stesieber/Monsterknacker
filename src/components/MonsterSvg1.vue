<script setup lang="ts">
import { computed } from 'vue';

type Tone = 'monster' | 'silver' | 'gold';
const props = withDefaults(defineProps<{ tone?: Tone }>(), { tone: 'monster' });

const body = computed(() =>
  props.tone === 'gold' ? '#f5c542' : props.tone === 'silver' ? '#c0c5cf' : '#ff6b6b'
);
const dark = computed(() =>
  props.tone === 'gold' ? '#c89a10' : props.tone === 'silver' ? '#8c95a8' : '#cc3333'
);
const heroShine = computed(() => (props.tone === 'gold' ? '#fff3a8' : '#e7ebf2'));
</script>

<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- Horns -->
    <polygon :fill="dark" points="33,44 26,18 44,40" />
    <polygon :fill="dark" points="67,44 74,18 56,40" />
    <!-- Body -->
    <ellipse cx="50" cy="63" rx="33" ry="29" :fill="body" />
    <!-- Eyes white -->
    <circle cx="39" cy="58" r="8" fill="white" />
    <circle cx="61" cy="58" r="8" fill="white" />
    <!-- Pupils -->
    <circle cx="41" cy="58" r="4.5" fill="#1f2433" />
    <circle cx="63" cy="58" r="4.5" fill="#1f2433" />
    <!-- Eye shine -->
    <circle cx="43" cy="56" r="1.8" fill="white" />
    <circle cx="65" cy="56" r="1.8" fill="white" />
    <!-- Smile -->
    <path
      d="M39,72 Q50,83 61,72"
      :stroke="dark"
      stroke-width="2.5"
      fill="none"
      stroke-linecap="round"
    />
    <!-- Cheek blush -->
    <circle cx="27" cy="68" r="6" fill="#ff9999" opacity="0.3" />
    <circle cx="73" cy="68" r="6" fill="#ff9999" opacity="0.3" />
    <!-- Hero: crown above horns -->
    <g v-if="tone !== 'monster'">
      <path
        d="M32,20 L38,9 L50,16 L62,9 L68,20 Z"
        :fill="heroShine"
        :stroke="body"
        stroke-width="1.5"
      />
      <circle cx="38" cy="9" r="2.5" :fill="body" />
      <circle cx="50" cy="16" r="2.5" :fill="body" />
      <circle cx="62" cy="9" r="2.5" :fill="body" />
    </g>
  </svg>
</template>
