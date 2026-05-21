import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import type { MonsterType, CreatureKind, LeitnerBox } from '../types/index';
import { useProfiles } from './useProfiles';
import { kindForBox } from '../utils/creature';

export interface CreatureEntry {
  taskId: string;
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
    return Object.entries(tasks).map(([taskId, state]) => {
      const [aPart, bPart] = taskId.split('x');
      return {
        taskId,
        a: Number(aPart),
        b: Number(bPart),
        monsterType: state.monsterType,
        box: state.box,
        kind: kindForBox(state.box),
      };
    });
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

  return {
    allCreatures,
    monsters,
    monstersByBox,
    heroes,
    monsterCount,
    heroCount,
    silverCount,
    goldCount,
  };
}
