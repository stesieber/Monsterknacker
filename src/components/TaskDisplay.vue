<script setup lang="ts">
import type { Task } from '../types/index';

defineProps<{ task: Task }>();
</script>

<template>
  <div class="task-display" aria-live="polite">
    <span class="task-operands">{{ task.a }} × {{ task.b }} =&nbsp;</span><span class="task-question">?</span>
  </div>
</template>

<style scoped>
.task-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  font-size: var(--font-size-task);
  font-weight: 800;
  color: var(--color-task-display);
  line-height: 1.1;
  text-align: center;
}

.task-question {
  color: var(--color-primary);
  animation: pulse-question 2s ease-in-out infinite;
}

@keyframes pulse-question {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@media (max-width: 480px) {
  .task-display {
    font-size: var(--font-size-task-mobile);
  }
}
</style>
