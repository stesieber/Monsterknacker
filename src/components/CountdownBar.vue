<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    remainingMs: number;
    totalMs: number;
    isPaused?: boolean;
  }>(),
  { isPaused: false },
);

const widthPercent = computed(() => {
  if (props.totalMs === 0) return 0;
  return Math.max(0, (props.remainingMs / props.totalMs) * 100);
});

const barColor = computed(() => {
  const pct = widthPercent.value;
  if (pct > 50) return 'var(--color-primary)';
  if (pct > 20) return 'var(--color-warning)';
  return 'var(--color-danger)';
});
</script>

<template>
  <div v-if="totalMs > 0" class="countdown-wrap" :class="{ 'is-paused': isPaused }">
    <div
      class="countdown-bar"
      role="progressbar"
      :aria-valuenow="Math.round(widthPercent)"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="{ width: widthPercent + '%', background: barColor }"
    />
  </div>
</template>

<style scoped>
.countdown-wrap {
  width: 100%;
  height: var(--countdown-height);
  background: var(--color-bar-bg);
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.countdown-wrap.is-paused {
  opacity: 0.35;
}

.countdown-bar {
  height: 100%;
  transition: width 100ms linear, background-color 200ms ease;
}
</style>
