<script setup lang="ts">
import { computed } from 'vue';
import type { LeitnerBox } from '../types/index';

const props = defineProps<{
  distribution: Record<LeitnerBox, number>;
}>();

const boxes: { box: LeitnerBox; label: string; colorVar: string }[] = [
  { box: 1, label: 'Neu', colorVar: '--bar-color-1' },
  { box: 2, label: 'In Übung', colorVar: '--bar-color-2' },
  { box: 3, label: 'Fast geschafft', colorVar: '--bar-color-3' },
  { box: 4, label: 'Silber', colorVar: '--bar-color-4' },
  { box: 5, label: 'Gold', colorVar: '--bar-color-5' },
];

const maxCount = computed(() => Math.max(...(Object.values(props.distribution) as number[]), 1));

function barPercent(box: LeitnerBox): number {
  const count = props.distribution[box];
  if (count === 0) return 0;
  return Math.max(4, Math.round((count / maxCount.value) * 100));
}

const ariaLabel = computed(() =>
  `Verteilung deiner Aufgaben: ${boxes.map((b) => `${props.distribution[b.box]} ${b.label}`).join(', ')}`
);
</script>

<template>
  <div class="bar-chart" role="img" :aria-label="ariaLabel">
    <div v-for="item in boxes" :key="item.box" class="bar-row">
      <span class="bar-label">{{ item.label }}</span>
      <div class="bar-track">
        <div
          class="bar-fill"
          :style="{ width: `${barPercent(item.box)}%`, background: `var(${item.colorVar})` }"
        ></div>
      </div>
      <span class="bar-count">{{ distribution[item.box] }}</span>
    </div>
  </div>
</template>

<style scoped>
.bar-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-row {
  display: grid;
  grid-template-columns: 110px 1fr 40px;
  align-items: center;
  gap: 10px;
}

.bar-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: right;
  white-space: nowrap;
}

.bar-track {
  height: 20px;
  background: var(--color-bar-bg);
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

@media (prefers-reduced-motion: reduce) {
  .bar-fill {
    transition: none;
  }
}

.bar-count {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  text-align: right;
}
</style>
