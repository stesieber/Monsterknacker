<script setup lang="ts">
import type { CreatureEntry } from '../composables/useMonsters';
import { OPERATION_SYMBOL } from '../types/index';
import MonsterIcon from './MonsterIcon.vue';
import { parseTaskId } from '../utils/task';
import { computed } from 'vue';

const props = defineProps<{ entry: CreatureEntry }>();

/** Anzeige-String aus der Task-ID rekonstruiert, z.B. "7 × 8" oder "56 ÷ 7". */
const displayLabel = computed(() => {
  try {
    return parseTaskId(props.entry.taskId).display;
  } catch {
    return `${props.entry.a} × ${props.entry.b}`;
  }
});
</script>

<template>
  <div class="creature-card">
    <span
      class="creature-op"
      :class="`creature-op--${entry.operation}`"
      aria-hidden="true"
    >{{ OPERATION_SYMBOL[entry.operation] }}</span>
    <MonsterIcon
      :type="entry.monsterType"
      :tone="entry.kind"
      :size="56"
      :decorative="false"
      :aria-label="`${entry.kind === 'gold' ? 'Goldheld' : entry.kind === 'silver' ? 'Silberheld' : 'Monster'} für ${displayLabel}`"
    />
    <span class="creature-label">{{ displayLabel }}</span>
  </div>
</template>

<style scoped>
.creature-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 10px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
  min-width: 72px;
}

.creature-op {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 0.8rem;
  font-weight: 800;
  line-height: 1;
  padding: 1px 4px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.04);
}

.creature-op--mul {
  color: #4b5563;
}

.creature-op--div {
  color: #a04846;
}

.creature-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  line-height: 1;
}
</style>
