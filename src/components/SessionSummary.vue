<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  taskCount: number;
  correctCount: number;
}>();
const emit = defineEmits<{ restart: []; exit: [] }>();

const percentage = computed(() =>
  props.taskCount > 0 ? Math.round((props.correctCount / props.taskCount) * 100) : 0,
);
</script>

<template>
  <div class="summary">
    <div class="summary-card">
      <h1 class="summary-title">Session beendet 🎉</h1>

      <template v-if="props.taskCount === 0">
        <p class="summary-text">Keine Aufgaben gelöst.</p>
      </template>

      <template v-else>
        <p class="summary-text">
          Du hast <strong>{{ props.taskCount }}</strong> Aufgaben gelöst.
        </p>
        <p class="summary-text">
          Davon waren <strong>{{ props.correctCount }}</strong> richtig.
        </p>
        <p class="summary-percentage">Das sind {{ percentage }} %.</p>
      </template>

      <div class="summary-actions">
        <button v-if="props.taskCount > 0" class="btn-primary" type="button" @click="emit('restart')">
          Nochmal üben
        </button>
        <button class="btn-secondary" type="button" @click="emit('exit')">
          Zum Startbildschirm
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.summary-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 40px 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 8px;
}

.summary-text {
  font-size: 1.1rem;
  color: var(--color-text);
}

.summary-percentage {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary {
  min-height: 56px;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  transition: background 0.15s;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-secondary {
  min-height: 52px;
  border-radius: 12px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.15s;
}

.btn-secondary:hover {
  background: #e8eaf0;
}
</style>
