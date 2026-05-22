import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import type { MonsterType, CreatureKind, LeitnerBox, Operation } from '../types/index';
import { useProfiles } from './useProfiles';
import { kindForBox } from '../utils/creature';
import { parseTaskId } from '../utils/task';

export interface CreatureEntry {
  taskId: string;
  operation: Operation;
  a: number;
  b: number;
  monsterType: MonsterType;
  box: LeitnerBox;
  kind: CreatureKind;
}

export function useMonsters() {
  const { activeProfile } = useProfiles();

  const allCreatures: ComputedRef<CreatureEntry[]> = computed(() => {
    const tasks = activeProfile.value?.tasks;
    if (!tasks) return [];
    const entries: CreatureEntry[] = [];
    for (const [taskId, state] of Object.entries(tasks)) {
      try {
        const task = parseTaskId(taskId);
        entries.push({
          taskId,
          operation: task.operation,
          a: task.a,
          b: task.b,
          monsterType: state.monsterType,
          box: state.box,
          kind: kindForBox(state.box),
        });
      } catch {
        // Defensive: skip unknown task IDs
      }
    }
    return entries;
  });

  const monsters: ComputedRef<CreatureEntry[]> = computed(() =>
    allCreatures.value
      .filter((e) => e.kind === 'monster')
      .sort((a, b) => b.box - a.box || a.a * a.b - b.a * b.b)
  );

  const monstersByBox: ComputedRef<Record<1 | 2 | 3, CreatureEntry[]>> = computed(() => {
    const result: Record<1 | 2 | 3, CreatureEntry[]> = { 1: [], 2: [], 3: [] };
    for (const entry of allCreatures.value) {
      if (entry.box === 1 || entry.box === 2 || entry.box === 3) {
        result[entry.box].push(entry);
      }
    }
    for (const box of [1, 2, 3] as const) {
      result[box].sort((a, b) => a.a * a.b - b.a * b.b);
    }
    return result;
  });

  const heroes: ComputedRef<CreatureEntry[]> = computed(() =>
    allCreatures.value
      .filter((e) => e.kind === 'silver' || e.kind === 'gold')
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'gold' ? -1 : 1;
        return a.a * a.b - b.a * b.b;
      })
  );

  const monsterCount: ComputedRef<number> = computed(() => monsters.value.length);
  const heroCount: ComputedRef<number> = computed(() => heroes.value.length);
  const silverCount: ComputedRef<number> = computed(
    () => heroes.value.filter((e) => e.kind === 'silver').length
  );
  const goldCount: ComputedRef<number> = computed(
    () => heroes.value.filter((e) => e.kind === 'gold').length
  );

  /** Box-gruppiert pro Operation — was MonstersScreen direkt braucht. */
  function monstersByBoxFor(op: Operation): Record<1 | 2 | 3, CreatureEntry[]> {
    const result: Record<1 | 2 | 3, CreatureEntry[]> = { 1: [], 2: [], 3: [] };
    for (const entry of allCreatures.value) {
      if (entry.operation !== op) continue;
      if (entry.box === 1 || entry.box === 2 || entry.box === 3) {
        result[entry.box].push(entry);
      }
    }
    for (const box of [1, 2, 3] as const) {
      result[box].sort((a, b) => a.a * a.b - b.a * b.b);
    }
    return result;
  }

  /** Helden gefiltert nach Operation. */
  function heroesFor(op: Operation): CreatureEntry[] {
    return heroes.value.filter((e) => e.operation === op);
  }

  const mulMonsterCount: ComputedRef<number> = computed(
    () => monsters.value.filter((e) => e.operation === 'mul').length
  );
  const divMonsterCount: ComputedRef<number> = computed(
    () => monsters.value.filter((e) => e.operation === 'div').length
  );
  const mulHeroCount: ComputedRef<number> = computed(
    () => heroes.value.filter((e) => e.operation === 'mul').length
  );
  const divHeroCount: ComputedRef<number> = computed(
    () => heroes.value.filter((e) => e.operation === 'div').length
  );

  return {
    allCreatures,
    monsters,
    monstersByBox,
    heroes,
    monsterCount,
    heroCount,
    silverCount,
    goldCount,
    monstersByBoxFor,
    heroesFor,
    mulMonsterCount,
    divMonsterCount,
    mulHeroCount,
    divHeroCount,
  };
}
