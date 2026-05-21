import { ref, readonly, computed, type Ref } from 'vue';
import type { Profile, SessionRepeat, Task } from '../types/index';
import { selectNextTask, updateSessionRepeats } from '../utils/leitner';

export function useTaskSelector() {
  const sessionRepeats: Ref<SessionRepeat[]> = ref([]);
  const previousTaskId = ref<string | undefined>(undefined);
  const taskCount = ref(0);

  function reset(): void {
    sessionRepeats.value = [];
    previousTaskId.value = undefined;
    taskCount.value = 0;
  }

  function next(profile: Profile): Task {
    const result = selectNextTask({
      profile,
      previousId: previousTaskId.value,
      currentTaskNum: taskCount.value,
      sessionRepeats: sessionRepeats.value,
    });

    if (result.fromRepeatQueue && result.repeatEntry) {
      sessionRepeats.value = sessionRepeats.value.filter((r) => r !== result.repeatEntry);
    }

    taskCount.value++;
    previousTaskId.value = result.task.id;

    console.debug(
      `[TaskSelector] task=${result.task.id} fromRepeat=${result.fromRepeatQueue} taskNum=${taskCount.value}`,
    );

    return result.task;
  }

  function recordResult(taskId: string, wasCorrect: boolean): void {
    sessionRepeats.value = updateSessionRepeats({
      sessionRepeats: sessionRepeats.value,
      taskId,
      wasCorrect,
      currentTaskNum: taskCount.value,
    });
  }

  return {
    next,
    recordResult,
    reset,
    taskCount: readonly(taskCount),
    pendingRepeatsCount: computed(() => sessionRepeats.value.length),
  };
}
