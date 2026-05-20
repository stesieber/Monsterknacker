<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTaskGenerator } from '../composables/useTaskGenerator';
import { useProfiles } from '../composables/useProfiles';
import type { Task } from '../composables/useTaskGenerator';
import TaskDisplay from './TaskDisplay.vue';
import AnswerInput from './AnswerInput.vue';
import AnswerFeedback from './AnswerFeedback.vue';
import SessionSummary from './SessionSummary.vue';

const emit = defineEmits<{ exit: [] }>();

const { nextTask } = useTaskGenerator();
const { recordTaskAttempt } = useProfiles();

const currentTask = ref<Task | null>(null);
const taskCount = ref(0);
const correctCount = ref(0);
const lastAnswer = ref<number | null>(null);
const phase = ref<'input' | 'feedback' | 'summary'>('input');
const inputKey = ref(0);

onMounted(() => {
  currentTask.value = nextTask();
});

function onSubmit(value: number) {
  if (!currentTask.value || phase.value !== 'input') return;
  const isCorrect = value === currentTask.value.answer;
  recordTaskAttempt(currentTask.value.id, isCorrect);
  lastAnswer.value = value;
  taskCount.value++;
  if (isCorrect) correctCount.value++;
  phase.value = 'feedback';
}

function onNext() {
  const prevId = currentTask.value?.id;
  currentTask.value = nextTask(prevId);
  inputKey.value++;
  phase.value = 'input';
}

function endSession() {
  phase.value = 'summary';
}

function restart() {
  currentTask.value = nextTask();
  taskCount.value = 0;
  correctCount.value = 0;
  lastAnswer.value = null;
  inputKey.value++;
  phase.value = 'input';
}
</script>

<template>
  <SessionSummary
    v-if="phase === 'summary'"
    :task-count="taskCount"
    :correct-count="correctCount"
    @restart="restart"
    @exit="emit('exit')"
  />

  <div v-else class="practice">
    <header class="practice-header">
      <span class="practice-task-nr">Aufgabe Nr. {{ taskCount + 1 }}</span>
      <button class="end-btn" type="button" @click="endSession">Beenden</button>
    </header>

    <main class="practice-main">
      <TaskDisplay v-if="currentTask" :task="currentTask" />

      <AnswerInput
        v-if="phase === 'input'"
        :key="inputKey"
        @submit="onSubmit"
      />

      <AnswerFeedback
        v-else-if="phase === 'feedback' && currentTask && lastAnswer !== null"
        :task="currentTask"
        :user-answer="lastAnswer"
        :is-correct="lastAnswer === currentTask.answer"
        @next="onNext"
      />
    </main>
  </div>
</template>

<style scoped>
.practice {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  max-width: 700px;
  margin: 0 auto;
}

.practice-header {
  flex-shrink: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.practice-task-nr {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.end-btn {
  padding: 8px 16px;
  border-radius: 10px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
  min-height: 44px;
  transition: background 0.15s;
}

.end-btn:hover {
  background: #e8eaf0;
}

.practice-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 32px 16px;
}
</style>
