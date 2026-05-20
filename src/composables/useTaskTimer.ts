import { ref, onScopeDispose } from 'vue';

export function useTaskTimer() {
  const remainingMs = ref(0);
  const totalMs = ref(0);
  const isRunning = ref(false);
  const isPaused = ref(false);

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let startTime = 0;
  let accumulatedMs = 0;
  let timeoutCallback: (() => void) | null = null;
  let active = false;
  let visibilityListenerRegistered = false;

  function clearTick() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function tick() {
    if (!active) return;
    const elapsed = accumulatedMs + (Date.now() - startTime);
    const remaining = totalMs.value - elapsed;
    remainingMs.value = Math.max(0, remaining);
    if (remaining <= 0) {
      const cb = timeoutCallback;
      stop();
      cb?.();
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      if (isRunning.value && !isPaused.value) pause();
    } else {
      if (isRunning.value && isPaused.value) resume();
    }
  }

  function start(timeoutMs: number, onTimeout: () => void): void {
    clearTick();
    active = true;
    totalMs.value = timeoutMs;
    remainingMs.value = timeoutMs;
    accumulatedMs = 0;
    startTime = Date.now();
    timeoutCallback = onTimeout;
    isRunning.value = true;
    isPaused.value = false;
    intervalId = setInterval(tick, 100);

    if (!visibilityListenerRegistered) {
      document.addEventListener('visibilitychange', onVisibilityChange);
      visibilityListenerRegistered = true;
    }
  }

  function stop(): void {
    active = false;
    clearTick();
    isRunning.value = false;
    isPaused.value = false;
    timeoutCallback = null;
  }

  function pause(): void {
    if (!isRunning.value || isPaused.value) return;
    clearTick();
    isPaused.value = true;
    accumulatedMs += Date.now() - startTime;
  }

  function resume(): void {
    if (!isRunning.value || !isPaused.value) return;
    isPaused.value = false;
    startTime = Date.now();
    intervalId = setInterval(tick, 100);
  }

  onScopeDispose(() => {
    clearTick();
    if (visibilityListenerRegistered) {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  });

  return { remainingMs, totalMs, isRunning, isPaused, start, stop, pause, resume };
}
