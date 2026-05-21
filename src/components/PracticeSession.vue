<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

const practiceEl = ref<HTMLDivElement | null>(null);
const currentTask = ref<Task | null>(null);
const taskCount = ref(0);
const correctCount = ref(0);
const lastAnswer = ref<number | null>(null);
const lastWasTimeout = ref(false);
const phase = ref<'input' | 'feedback' | 'summary'>('input');
const inputKey = ref(0);
const sessionDurationMs = ref(0);
const showCorrectToast = ref(false);
let lastSavedSessionMs = 0;

const sessionTimeDisplay = computed(() => formatMs(sessionTimer.elapsedMs.value));

// Firefox Mobile offsets the visual viewport when the soft keyboard opens,
// causing position:fixed elements to drift off-screen. We compensate by
// syncing the container's top/height to the visual viewport in real time.
function syncVisualViewport() {
  if (!practiceEl.value || !window.visualViewport) return;
  const { offsetTop, height } = window.visualViewport;
  practiceEl.value.style.top = `${offsetTop}px`;
  practiceEl.value.style.height = `${height}px`;
}

onMounted(() => {
  selector.reset();
  currentTask.value = selector.next(activeProfile.value!);
  if (props.config.mode === 'training') {
    sessionTimer.start();
    taskTimer.start(DIFFICULTY_TIMEOUT_MS[props.config.difficulty!], onTimeout);
  }
  window.visualViewport?.addEventListener('resize', syncVisualViewport);
  window.visualViewport?.addEventListener('scroll', syncVisualViewport);
});

onUnmounted(() => {
  window.visualViewport?.removeEventListener('resize', syncVisualViewport);
  window.visualViewport?.removeEventListener('scroll', syncVisualViewport);
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
  // Explicitly dismiss the soft keyboard before switching to feedback phase.
  (document.activeElement as HTMLElement | null)?.blur();
  const isCorrect = value === currentTask.value.answer;
  recordTaskAttempt(currentTask.value.id, isCorrect);
  selector.recordResult(currentTask.value.id, isCorrect);
  lastAnswer.value = value;
  lastWasTimeout.value = false;
  taskCount.value++;
  if (isCorrect) correctCount.value++;
  if (props.config.mode === 'training') trackPracticeTime();

  if (isCorrect) {
    showCorrectToast.value = true;
    onNext();
    setTimeout(() => { showCorrectToast.value = false; }, 900);
  } else {
    phase.value = 'feedback';
  }
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

  <div v-else ref="practiceEl" class="practice">
    <div v-if="showCorrectToast" class="correct-toast" aria-hidden="true">👍</div>

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

    <main class="practice-main">
      <div class="practice-content" :class="{ 'practice-content--feedback': phase === 'feedback' }">
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
      </div>
    </main>
  </div>
</template>

<style scoped>
.practice {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.practice-top {
  flex-shrink: 0;
  background: var(--color-surface);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.practice-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
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
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.practice-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(20px, 5vh, 40px);
  padding: clamp(16px, 4vh, 32px) 16px;
  width: 100%;
  max-width: 360px;
  /* margin:auto centers when content fits; collapses to 0 when overflowing
     so overflow starts from the top (correctly scrollable). */
  margin: auto;
}

/* During feedback, anchor content to the top so it doesn't jump as the
   keyboard closes and margin:auto recalculates with the growing viewport. */
.practice-content--feedback {
  margin-top: 0;
  margin-bottom: auto;
}

.correct-toast {
  position: absolute;
  top: 72px;
  right: 16px;
  font-size: 2.8rem;
  line-height: 1;
  pointer-events: none;
  z-index: 50;
  animation: toast-pop 900ms ease-out forwards;
}

@keyframes toast-pop {
  0%   { opacity: 0; transform: scale(0.3); }
  25%  { opacity: 1; transform: scale(1.25); }
  40%  { opacity: 1; transform: scale(1); }
  75%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.9); }
}
</style>
