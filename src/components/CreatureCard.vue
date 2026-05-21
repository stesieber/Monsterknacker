<script setup lang="ts">
import type { CreatureEntry } from '../composables/useMonsters';
import MonsterIcon from './MonsterIcon.vue';

defineProps<{ entry: CreatureEntry }>();
</script>

<template>
  <div class="creature-card">
    <MonsterIcon
      :type="entry.monsterType"
      :tone="entry.kind"
      :size="56"
      :decorative="false"
      :aria-label="`${entry.kind === 'gold' ? 'Goldheld' : entry.kind === 'silver' ? 'Silberheld' : 'Monster'} für ${entry.a} mal ${entry.b}`"
    />
    <span class="creature-label">{{ entry.a }} × {{ entry.b }}</span>
  </div>
</template>

<style scoped>
.creature-card {
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

.creature-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  line-height: 1;
}
</style>
