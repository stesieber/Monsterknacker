<script setup lang="ts">
import type { TaskStat } from '../types/index';
import { kindForBox } from '../utils/creature';
import MonsterIcon from './MonsterIcon.vue';

defineProps<{
  title: string;
  entries: TaskStat[];
}>();
</script>

<template>
  <section class="top-task-list">
    <h3 class="top-task-title">{{ title }}</h3>
    <p v-if="entries.length === 0" class="top-task-empty">Noch keine — übe weiter!</p>
    <ul v-else class="top-task-entries">
      <li v-for="entry in entries" :key="entry.taskId" class="top-task-entry">
        <MonsterIcon
          :type="entry.monsterType"
          :tone="kindForBox(entry.box)"
          :size="40"
          :decorative="true"
        />
        <span class="top-task-display">{{ entry.display }}</span>
        <span class="top-task-rate">
          <template v-if="entry.successRate !== null">
            {{ Math.round(entry.successRate * 100) }}&thinsp;%
          </template>
          <template v-else>
            <span class="top-task-unplayed">noch nie geübt</span>
          </template>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.top-task-list {
  width: 100%;
}

.top-task-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 10px;
}

.top-task-empty {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.top-task-entries {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.top-task-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 10px 14px;
}

.top-task-display {
  flex: 1;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.top-task-rate {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.top-task-unplayed {
  font-style: italic;
  font-weight: 400;
}
</style>
