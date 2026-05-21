<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskSelector } from '../composables/useTaskSelector';
import { useProfiles } from '../composables/useProfiles';
import { useTaskTimer } from '../composables/useTaskTimer';
import { useSessionTimer } from '../composables/useSessionTimer';
import type { Task } from '../types/index';
import type { SessionConfig } from '../types/index';
import { DIFFICULTY_TIMEOUT_MS } from '../types/index';
import { formatMs } from '../utils/time';
import TaskDisplay from './TaskDisplay.vue';
import AnswerInput from './AnswerInput.vue';
import AnswerFeedback from './AnswerFeedback.vue';
import SessionSummary from './SessionSummary.vue';
import CountdownBar from './CountdownBar.vue';

const props = defineProps<{ config: SessionConfig }>();
const emit = defineEmits<{ exit: [] }>();

const selector = useTaskSelector();
const { activeProfile, recordTaskAttempt, addPracticeTimeMs } = useProfiles();
const taskTimer = useTaskTimer();
const sessionTimer = useSessionTimer();

const currentTask = ref<Task | null>(null);
const taskCount = ref(0);
const correctCount = ref(0);
const lastAnswer = ref<number | null>(null);
const lastWasTimeout = ref(false);
const phase = ref<'input' | 'feedback' | 'summary'>('input');
const inputKey = ref(0);
const sessionDurationMs = ref(0);
let lastSavedSessionMs = 0;

const sessionTimeDisplay = computed(() => formatMs(sessionTimer.elapsedMs.value));

onMounted(() => {
  selector.reset();
  currentTask.value = selector.next(activeProfile.value!);
  if (props.config.mode === 'training') {
    sessionTimer.start();
    taskTimer.start(DIFFICULTY_TIMEOUT_MS[props.config.difficulty!], onTimeout);
  }
});

function trackPracticeTime() {
  const current = sessionTimer.elapsedMs.value;
  const delta = current - lastSavedSessionMs;
  if (delta > 0) addPracticeTimeMs(delta);
  lastSavedSessionMs = current;
}

function onTimeout() {
  if (!currentTask.value || phase.value !== 'input') return;
  recordTaskAttempt(currentTask.value.id, false);
  selector.recordResult(currentTask.value.id, false);
  lastAnswer.value = null;
  lastWasTimeout.value = true;
  taskCount.value++;
  trackPracticeTime();
  phase.value = 'feedback';
}

function onSubmit(value: number) {
  if (!currentTask.value || phase.value !== 'input') return;
  if (props.config.mode === 'training') taskTimer.stop();
  const isCorrect = value === currentTask.value.answer;
  recordTaskAttempt(currentTask.value.id, isCorrect);
  selector.recordResult(currentTask.value.id, isCorrect);
  lastAnswer.value = value;
  lastWasTimeout.value = false;
  taskCount.value++;
  if (isCorrect) correctCount.value++;
  if (props.config.mode === 'training') trackPracticeTime();
  phase.value = 'feedback';
}

function onNext() {
  currentTask.value = selector.next(activeProfile.value!);
  inputKey.value++;
  lastWasTimeout.value = false;
  phase.value = 'input';
  if (props.config.mode === 'training') {
    taskTimer.start(DIFFICULTY_TIMEOUT_MS[props.config.difficulty!], onTimeout);
  }
}

function endSession() {
  if (props.config.mode === 'training') {
    taskTimer.stop();
    sessionTimer.stop();
    trackPracticeTime();
    sessionDurationMs.value = sessionTimer.elapsedMs.value;
  }
  phase.value = 'summary';
}

function restart() {
  if (props.config.mode === 'training') {
    taskTimer.stop();
    sessionTimer.stop();
  }
  selector.reset();
  currentTask.value = selector.next(activeProfile.value!);
  taskCount.value = 0;
  correctCount.value = 0;
  lastAnswer.value = null;
  lastWasTimeout.value = false;
  lastSavedSessionMs = 0;
  sessionDurationMs.value = 0;
  inputKey.value++;
  phase.value = 'input';
  if (props.config.mode === 'training') {
    sessionTimer.start();
    taskTimer.start(DIFFICULTY_TIMEOUT_MS[props.config.difficulty!], onTimeout);
  }
}
</script>

<template>
  <SessionSummary
    v-if="phase === 'summary'"
    :task-count="taskCount"
    :correct-count="correctCount"
    :session-ms="config.mode === 'training' ? sessionDurationMs : undefined"
    @restart="restart"
    @exit="emit('exit')"
  />

  <div v-else class="practice">
    <div class="practice-top">
      <CountdownBar
        v-if="config.mode === 'training'"
        :remaining-ms="taskTimer.remainingMs.value"
        :total-ms="taskTimer.totalMs.value"
        :is-paused="taskTimer.isPaused.value"
      />

      <header class="practice-header">
        <span class="practice-task-nr">Aufgabe Nr. {{ taskCount + 1 }}</span>

        <span v-if="config.mode === 'training'" class="practice-session-time">
          {{ sessionTimeDisplay }}
          <span v-if="sessionTimer.isPaused.value" class="pause-icon" title="Pausiert">⏸</span>
        </span>

        <button class="end-btn" type="button" @click="endSession">Beenden</button>
      </header>
    </div>

    <div class="practice-top-spacer" :class="{ 'has-countdown': config.mode === 'training' }" />

    <main class="practice-main">
      <TaskDisplay v-if="currentTask" :task="currentTask" />

      <AnswerInput
        v-if="phase === 'input'"
        :key="inputKey"
        @submit="onSubmit"
      />

      <AnswerFeedback
        v-else-if="phase === 'feedback' && currentTask && (lastAnswer !== null || lastWasTimeout)"
        :task="currentTask"
        :user-answer="lastAnswer ?? 0"
        :is-correct="!lastWasTimeout && lastAnswer === currentTask.answer"
        :is-timeout="lastWasTimeout"
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

.practice-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: var(--color-surface);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.practice-top-spacer {
  flex-shrink: 0;
  height: 56px;
}

.practice-top-spacer.has-countdown {
  height: 64px; /* 56px header + 8px countdown bar */
}

.practice-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.practice-task-nr {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

.practice-session-time {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 4px;
}

.pause-icon {
  font-size: 0.8rem;
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
  min-height: 0; /* allow flex child to shrink when keyboard opens */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 5vh, 40px);
  padding: clamp(16px, 4vh, 32px) 16px;
}
</style>
