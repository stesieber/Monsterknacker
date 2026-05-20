import { ref, onScopeDispose } from 'vue';

const INACTIVITY_MS = 30_000;

export function useSessionTimer() {
  const elapsedMs = ref(0);
  const isRunning = ref(false);
  const isPaused = ref(false);

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let startTime = 0;
  let accumulatedMs = 0;
  let inactivityTimeout: ReturnType<typeof setTimeout> | null = null;
  let listenersActive = false;

  function clearTick() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function clearInactivityTimeout() {
    if (inactivityTimeout !== null) {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = null;
    }
  }

  function tick() {
    elapsedMs.value = accumulatedMs + (Date.now() - startTime);
  }

  function resetInactivityTimer() {
    clearInactivityTimeout();
    inactivityTimeout = setTimeout(() => {
      if (isRunning.value && !isPaused.value) pause();
    }, INACTIVITY_MS);
  }

  function pause() {
    if (!isRunning.value || isPaused.value) return;
    clearTick();
    clearInactivityTimeout();
    isPaused.value = true;
    accumulatedMs += Date.now() - startTime;
  }

  function resume() {
    if (!isRunning.value || !isPaused.value) return;
    isPaused.value = false;
    startTime = Date.now();
    intervalId = setInterval(tick, 100);
    resetInactivityTimer();
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      if (isRunning.value && !isPaused.value) pause();
    } else if (document.visibilityState === 'visible') {
      if (isRunning.value && isPaused.value) resume();
    }
  }

  function onInteraction() {
    if (!isRunning.value) return;
    if (isPaused.value) {
      resume();
    } else {
      resetInactivityTimer();
    }
  }

  function registerListeners() {
    if (listenersActive) return;
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('keydown', onInteraction);
    document.addEventListener('pointerdown', onInteraction);
    document.addEventListener('touchstart', onInteraction);
    listenersActive = true;
  }

  function removeListeners() {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    document.removeEventListener('keydown', onInteraction);
    document.removeEventListener('pointerdown', onInteraction);
    document.removeEventListener('touchstart', onInteraction);
    listenersActive = false;
  }

  function start(): void {
    clearTick();
    clearInactivityTimeout();
    accumulatedMs = 0;
    elapsedMs.value = 0;
    startTime = Date.now();
    isRunning.value = true;
    isPaused.value = false;
    intervalId = setInterval(tick, 100);
    registerListeners();
    resetInactivityTimer();
  }

  function stop(): void {
    if (!isPaused.value) {
      accumulatedMs += Date.now() - startTime;
    }
    elapsedMs.value = accumulatedMs;
    clearTick();
    clearInactivityTimeout();
    isRunning.value = false;
    isPaused.value = false;
  }

  onScopeDispose(() => {
    clearTick();
    clearInactivityTimeout();
    removeListeners();
  });

  return { elapsedMs, isRunning, isPaused, start, pause, resume, stop };
}
