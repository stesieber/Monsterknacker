<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Task } from '../composables/useTaskGenerator';

const props = defineProps<{
  task: Task;
  userAnswer: number;
  isCorrect: boolean;
}>();
const emit = defineEmits<{ next: [] }>();

const nextBtnRef = ref<HTMLButtonElement | null>(null);

onMounted(() => {
  nextBtnRef.value?.focus();
});
</script>

<template>
  <div class="feedback" :class="isCorrect ? 'feedback--correct' : 'feedback--wrong'">
    <div class="feedback-icon" aria-hidden="true">{{ isCorrect ? '✓' : '✗' }}</div>

    <p class="feedback-label">{{ isCorrect ? 'Richtig!' : 'Nicht ganz.' }}</p>

    <p class="feedback-equation">
      {{ props.task.a }} × {{ props.task.b }} =
      <strong class="feedback-answer">{{ props.task.answer }}</strong>
    </p>

    <p v-if="!isCorrect" class="feedback-user-answer">
      Deine Antwort: {{ props.userAnswer }}
    </p>

    <button
      ref="nextBtnRef"
      class="next-btn"
      type="button"
      @click="emit('next')"
    >
      Weiter
    </button>
  </div>
</template>

<style scoped>
.feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 20px;
  border-radius: var(--radius);
  width: 100%;
  max-width: 360px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.feedback-icon {
  font-size: 3rem;
  line-height: 1;
  font-weight: 700;
}

.feedback--correct .feedback-icon {
  color: var(--color-feedback-correct);
}

.feedback--wrong .feedback-icon {
  color: var(--color-feedback-wrong);
}

.feedback-label {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text);
}

.feedback-equation {
  font-size: 1.2rem;
  color: var(--color-text);
}

.feedback-answer {
  color: var(--color-feedback-correct);
  font-weight: 800;
}

.feedback-user-answer {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.next-btn {
  margin-top: 12px;
  width: 100%;
  min-height: 56px;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  transition: background 0.15s;
}

.next-btn:hover {
  background: var(--color-primary-dark);
}
</style>
