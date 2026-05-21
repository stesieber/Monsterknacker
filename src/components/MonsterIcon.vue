<script setup lang="ts">
import { computed } from 'vue';
import type { MonsterType, CreatureKind } from '../types/index';
import MonsterSvg1 from './MonsterSvg1.vue';
import MonsterSvg2 from './MonsterSvg2.vue';
import MonsterSvg3 from './MonsterSvg3.vue';

const props = withDefaults(
  defineProps<{
    type: MonsterType;
    tone: CreatureKind;
    size?: number;
    decorative?: boolean;
  }>(),
  { size: 64, decorative: false }
);

const svgComponent = computed(() => {
  if (props.type === 1) return MonsterSvg2;
  if (props.type === 2) return MonsterSvg3;
  return MonsterSvg1;
});

const ariaLabel = computed(() => {
  if (props.decorative) return undefined;
  const kindLabel =
    props.tone === 'gold' ? 'Goldheld' : props.tone === 'silver' ? 'Silberheld' : 'Monster';
  return kindLabel;
});
</script>

<template>
  <span
    class="monster-icon"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :role="decorative ? undefined : 'img'"
    :aria-label="ariaLabel"
  >
    <component :is="svgComponent" :tone="tone" />
  </span>
</template>

<style scoped>
.monster-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.monster-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
