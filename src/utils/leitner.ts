import type { LeitnerBox, Profile, SessionRepeat, Task, TaskState } from '../types/index';
import {
  LEITNER_BOX_WEIGHTS,
  SESSION_REPEAT_MIN_GAP,
  SESSION_REPEAT_MAX_GAP,
  SMALL_TABLE_TASK_IDS,
} from '../types/index';
import { parseTaskId } from './task';

/** Übergangsfunktion: liefert das neue Fach nach einer Antwort. */
export function nextBox(currentBox: LeitnerBox, wasCorrect: boolean): LeitnerBox {
  if (!wasCorrect) return 1;
  return Math.min(5, currentBox + 1) as LeitnerBox;
}

/** Stellt sicher, dass für jede der 81 Aufgaben ein TaskState existiert (Box 1 default).
 *  Wird für Tests / Default-Fallback genutzt. */
export function ensureAllSmallTableTasks(tasks: Record<string, TaskState>): Record<string, TaskState> {
  const result: Record<string, TaskState> = { ...tasks };
  for (const id of SMALL_TABLE_TASK_IDS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = result[id] as any;
    if (!existing) {
      result[id] = { attempts: 0, correct: 0, box: 1, monsterType: 0 };
    } else if (!existing.box) {
      result[id] = { ...existing, box: 1 } as TaskState;
    }
  }
  return result;
}

/**
 * Wählt die nächste Aufgabe adaptiv aus einem definierten Pool.
 *
 * Priorität:
 *   1. Fällige Session-Repeats (dueAtTaskNum <= currentTaskNum) — älteste zuerst,
 *      nur Repeats mit taskId im aktuellen Pool werden berücksichtigt
 *   2. Gewichtete Leitner-Auswahl innerhalb des Pools (Box 1 dominiert)
 *
 * Vermeidet previousId. Achtung: mutiert sessionRepeats NICHT.
 */
export function selectNextTask(args: {
  profile: Profile;
  poolIds?: readonly string[];
  previousId?: string;
  currentTaskNum: number;
  sessionRepeats: SessionRepeat[];
}): { task: Task; fromRepeatQueue: boolean; repeatEntry?: SessionRepeat } {
  const { profile, previousId, currentTaskNum, sessionRepeats } = args;
  const poolIds = args.poolIds ?? SMALL_TABLE_TASK_IDS;

  if (poolIds.length === 0) {
    throw new Error('selectNextTask: poolIds darf nicht leer sein');
  }

  const poolSet = new Set(poolIds);

  // 1. Check for due session repeats, sorted oldest first; pool-gefiltert.
  const dueRepeats = sessionRepeats
    .filter((r) => poolSet.has(r.taskId) && r.dueAtTaskNum <= currentTaskNum)
    .sort((a, b) => a.dueAtTaskNum - b.dueAtTaskNum);

  if (dueRepeats.length > 0) {
    const repeatToUse = dueRepeats.find((r) => r.taskId !== previousId) ?? null;
    if (repeatToUse) {
      return {
        task: parseTaskId(repeatToUse.taskId),
        fromRepeatQueue: true,
        repeatEntry: repeatToUse,
      };
    }
    // All due repeats equal previousId → fall through to Leitner
  }

  // 2. Leitner weighted selection within the pool
  const tasks = profile.tasks ?? {};

  const weights = poolIds.map((id) => {
    if (id === previousId) return 0;
    const state = tasks[id];
    const box = state?.box ?? 1;
    const clampedBox = Math.max(1, Math.min(5, box)) as LeitnerBox;
    return LEITNER_BOX_WEIGHTS[clampedBox];
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  if (totalWeight === 0) {
    // Edge case: only one task in pool and it equals previousId
    return { task: parseTaskId(previousId ?? poolIds[0]), fromRepeatQueue: false };
  }

  let rand = Math.random() * totalWeight;
  for (let i = 0; i < poolIds.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      return { task: parseTaskId(poolIds[i]), fromRepeatQueue: false };
    }
  }

  // Floating-point fallback: return last task with non-zero weight
  for (let i = poolIds.length - 1; i >= 0; i--) {
    if (weights[i] > 0) {
      return { task: parseTaskId(poolIds[i]), fromRepeatQueue: false };
    }
  }

  return { task: parseTaskId(poolIds[0]), fromRepeatQueue: false };
}

/**
 * Berechnet Session-Repeat-Aktualisierung nach einer Antwort.
 *
 * - wasCorrect=true: entfernt einen evtl. bestehenden Eintrag für taskId
 * - wasCorrect=false: fügt einen neuen Eintrag hinzu
 *
 * Mutiert das Eingabearray nicht.
 */
export function updateSessionRepeats(args: {
  sessionRepeats: SessionRepeat[];
  taskId: string;
  wasCorrect: boolean;
  currentTaskNum: number;
  randInt?: (min: number, max: number) => number;
}): SessionRepeat[] {
  const { sessionRepeats, taskId, wasCorrect, currentTaskNum, randInt } = args;
  const filtered = sessionRepeats.filter((r) => r.taskId !== taskId);
  if (wasCorrect) return filtered;
  const _randInt = randInt ?? ((min, max) => Math.floor(Math.random() * (max - min + 1)) + min);
  const gap = _randInt(SESSION_REPEAT_MIN_GAP, SESSION_REPEAT_MAX_GAP);
  return [...filtered, { taskId, dueAtTaskNum: currentTaskNum + gap }];
}
