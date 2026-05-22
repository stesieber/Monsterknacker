import { computed, type ComputedRef } from 'vue';
import { useProfiles } from './useProfiles';
import { parseTaskId } from '../utils/task';
import type { LeitnerBox, TaskStat } from '../types/index';

export function useStats() {
  const { activeProfile } = useProfiles();

  const allTaskStats: ComputedRef<TaskStat[]> = computed(() => {
    const tasks = activeProfile.value?.tasks;
    if (!tasks) return [];
    const result: TaskStat[] = [];
    for (const [taskId, state] of Object.entries(tasks)) {
      try {
        const task = parseTaskId(taskId);
        result.push({
          taskId,
          operation: task.operation,
          a: task.a,
          b: task.b,
          display: task.display,
          box: state.box,
          attempts: state.attempts,
          correct: state.correct,
          monsterType: state.monsterType,
          successRate: state.attempts > 0 ? state.correct / state.attempts : null,
        });
      } catch {
        // skip unknown IDs
      }
    }
    return result;
  });

  const leitnerDistribution: ComputedRef<Record<LeitnerBox, number>> = computed(() => {
    const dist: Record<LeitnerBox, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const t of allTaskStats.value) {
      dist[t.box]++;
    }
    return dist;
  });

  const solvedCount: ComputedRef<number> = computed(() =>
    allTaskStats.value.reduce((sum, t) => sum + t.correct, 0)
  );

  const totalAttempts: ComputedRef<number> = computed(() =>
    allTaskStats.value.reduce((sum, t) => sum + t.attempts, 0)
  );

  const lifetimeMs: ComputedRef<number> = computed(
    () => activeProfile.value?.stats?.totalPracticeMs ?? 0
  );

  const strongestTasks: ComputedRef<TaskStat[]> = computed(() => {
    return allTaskStats.value
      .filter((t) => t.box === 4 || t.box === 5)
      .sort((a, b) => {
        if (b.box !== a.box) return b.box - a.box;
        const arateNull = a.successRate === null;
        const brateNull = b.successRate === null;
        if (!arateNull && !brateNull) {
          if (b.successRate! !== a.successRate!) return b.successRate! - a.successRate!;
        } else if (arateNull !== brateNull) {
          return arateNull ? 1 : -1;
        }
        return a.taskId < b.taskId ? -1 : a.taskId > b.taskId ? 1 : 0;
      })
      .slice(0, 5);
  });

  const weakestTasks: ComputedRef<TaskStat[]> = computed(() => {
    const box12 = allTaskStats.value.filter((t) => t.box === 1 || t.box === 2);
    const tried = box12
      .filter((t) => t.attempts > 0)
      .sort((a, b) => {
        const aRate = a.successRate!;
        const bRate = b.successRate!;
        if (aRate !== bRate) return aRate - bRate;
        if (a.box !== b.box) return a.box - b.box;
        if (b.attempts !== a.attempts) return b.attempts - a.attempts;
        return a.taskId < b.taskId ? -1 : a.taskId > b.taskId ? 1 : 0;
      });

    if (tried.length >= 5) return tried.slice(0, 5);

    const untried = box12
      .filter((t) => t.attempts === 0 && t.box === 1)
      .sort((a, b) => (a.taskId < b.taskId ? -1 : a.taskId > b.taskId ? 1 : 0));

    return [...tried, ...untried].slice(0, 5);
  });

  return {
    allTaskStats,
    leitnerDistribution,
    solvedCount,
    totalAttempts,
    lifetimeMs,
    strongestTasks,
    weakestTasks,
  };
}
