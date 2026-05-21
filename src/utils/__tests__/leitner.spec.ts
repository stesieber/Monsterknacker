import { describe, it, expect } from 'vitest';
import { nextBox, selectNextTask, updateSessionRepeats, ensureAllSmallTableTasks } from '../leitner';
import type { Profile, TaskState } from '../../types/index';
import { SMALL_TABLE_TASK_IDS } from '../../types/index';

function makeProfileWithBoxes(boxes: Record<string, number>): Profile {
  const tasks: Record<string, TaskState> = {};
  for (const id of SMALL_TABLE_TASK_IDS) {
    const box = (boxes[id] ?? 1) as 1 | 2 | 3 | 4 | 5;
    tasks[id] = { attempts: 0, correct: 0, box };
  }
  return { id: 'test', name: 'Test', emoji: '🐶', createdAt: 0, tasks };
}

describe('nextBox', () => {
  it('promotes correct answers by 1', () => {
    expect(nextBox(1, true)).toBe(2);
    expect(nextBox(2, true)).toBe(3);
    expect(nextBox(3, true)).toBe(4);
    expect(nextBox(4, true)).toBe(5);
  });

  it('caps at box 5 on correct answer', () => {
    expect(nextBox(5, true)).toBe(5);
  });

  it('demotes wrong answers to box 1', () => {
    expect(nextBox(1, false)).toBe(1);
    expect(nextBox(2, false)).toBe(1);
    expect(nextBox(3, false)).toBe(1);
    expect(nextBox(5, false)).toBe(1);
  });
});

describe('selectNextTask', () => {
  it('returns a valid task object', () => {
    const profile = makeProfileWithBoxes({});
    const result = selectNextTask({ profile, currentTaskNum: 1, sessionRepeats: [] });
    expect(result.task).toMatchObject({ id: expect.any(String), a: expect.any(Number), b: expect.any(Number), answer: expect.any(Number) });
    expect(result.fromRepeatQueue).toBe(false);
    expect(result.repeatEntry).toBeUndefined();
  });

  it('prefers Box 1 over Box 5 (statistical)', () => {
    // All tasks in box 5, except 1x1 in box 1
    const allBox5 = Object.fromEntries(SMALL_TABLE_TASK_IDS.map((id) => [id, 5]));
    const profile = makeProfileWithBoxes({ ...allBox5, '1x1': 1 });

    const picks = Array.from({ length: 2000 }, () =>
      selectNextTask({ profile, currentTaskNum: 1, sessionRepeats: [] }).task.id,
    );
    const box1Count = picks.filter((id) => id === '1x1').length;
    const totalOthers = picks.filter((id) => id !== '1x1').length;
    const avgOtherCount = totalOthers / 80; // 80 box-5 tasks
    // 1x1 weight=10, others weight=1 each (80 tasks) → 1x1 gets 10/90 ≈ 11.1%
    // avg other task gets 1/90 ≈ 1.1% → ratio should be ≥ 5x
    expect(box1Count).toBeGreaterThan(avgOtherCount * 5);
  });

  it('returns due repeat before Leitner pick', () => {
    const profile = makeProfileWithBoxes({});
    const result = selectNextTask({
      profile,
      currentTaskNum: 5,
      sessionRepeats: [{ taskId: '7x8', dueAtTaskNum: 4 }],
    });
    expect(result.task.id).toBe('7x8');
    expect(result.fromRepeatQueue).toBe(true);
    expect(result.repeatEntry).toEqual({ taskId: '7x8', dueAtTaskNum: 4 });
  });

  it('picks oldest due repeat first', () => {
    const profile = makeProfileWithBoxes({});
    const result = selectNextTask({
      profile,
      currentTaskNum: 10,
      sessionRepeats: [
        { taskId: '3x4', dueAtTaskNum: 9 },
        { taskId: '5x6', dueAtTaskNum: 7 },
      ],
    });
    expect(result.task.id).toBe('5x6'); // dueAtTaskNum 7 is older
    expect(result.fromRepeatQueue).toBe(true);
  });

  it('does not return repeat not yet due', () => {
    const profile = makeProfileWithBoxes({});
    for (let i = 0; i < 20; i++) {
      const result = selectNextTask({
        profile,
        currentTaskNum: 3,
        sessionRepeats: [{ taskId: '7x8', dueAtTaskNum: 4 }],
      });
      expect(result.fromRepeatQueue).toBe(false);
    }
  });

  it('skips repeat equal to previousId, falls back to next due', () => {
    const profile = makeProfileWithBoxes({});
    const result = selectNextTask({
      profile,
      previousId: '7x8',
      currentTaskNum: 5,
      sessionRepeats: [
        { taskId: '7x8', dueAtTaskNum: 4 },
        { taskId: '3x3', dueAtTaskNum: 5 },
      ],
    });
    expect(result.task.id).toBe('3x3');
    expect(result.fromRepeatQueue).toBe(true);
  });

  it('skips repeat equal to previousId, falls through to Leitner', () => {
    const profile = makeProfileWithBoxes({});
    const result = selectNextTask({
      profile,
      previousId: '7x8',
      currentTaskNum: 5,
      sessionRepeats: [{ taskId: '7x8', dueAtTaskNum: 4 }],
    });
    expect(result.task.id).not.toBe('7x8');
    expect(result.fromRepeatQueue).toBe(false);
  });

  it('never returns previousId via Leitner when alternatives exist', () => {
    const profile = makeProfileWithBoxes({});
    for (let i = 0; i < 100; i++) {
      const result = selectNextTask({
        profile,
        previousId: '1x1',
        currentTaskNum: 1,
        sessionRepeats: [],
      });
      expect(result.task.id).not.toBe('1x1');
    }
  });

  it('handles profile with no tasks (uses defaults)', () => {
    const profile: Profile = { id: 'empty', name: 'Empty', emoji: '🐶', createdAt: 0 };
    const result = selectNextTask({ profile, currentTaskNum: 1, sessionRepeats: [] });
    expect(result.task).toBeDefined();
    expect(result.fromRepeatQueue).toBe(false);
  });

  it('does not mutate sessionRepeats', () => {
    const profile = makeProfileWithBoxes({});
    const repeats = [{ taskId: '7x8', dueAtTaskNum: 1 }];
    selectNextTask({ profile, currentTaskNum: 5, sessionRepeats: repeats });
    expect(repeats).toHaveLength(1);
  });
});

describe('updateSessionRepeats', () => {
  it('adds repeat entry on wrong answer with injected randInt', () => {
    const result = updateSessionRepeats({
      sessionRepeats: [],
      taskId: '7x8',
      wasCorrect: false,
      currentTaskNum: 5,
      randInt: () => 3,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ taskId: '7x8', dueAtTaskNum: 8 });
  });

  it('removes repeat entry on correct answer', () => {
    const result = updateSessionRepeats({
      sessionRepeats: [{ taskId: '7x8', dueAtTaskNum: 8 }],
      taskId: '7x8',
      wasCorrect: true,
      currentTaskNum: 10,
    });
    expect(result).toHaveLength(0);
  });

  it('produces gap within [3,5] range', () => {
    for (let i = 0; i < 50; i++) {
      const result = updateSessionRepeats({
        sessionRepeats: [],
        taskId: '1x1',
        wasCorrect: false,
        currentTaskNum: 0,
      });
      expect(result[0].dueAtTaskNum).toBeGreaterThanOrEqual(3);
      expect(result[0].dueAtTaskNum).toBeLessThanOrEqual(5);
    }
  });

  it('replaces existing repeat on re-fail (no duplicate entries)', () => {
    const result = updateSessionRepeats({
      sessionRepeats: [{ taskId: '7x8', dueAtTaskNum: 5 }],
      taskId: '7x8',
      wasCorrect: false,
      currentTaskNum: 10,
      randInt: () => 3,
    });
    expect(result).toHaveLength(1);
    expect(result[0].dueAtTaskNum).toBe(13);
  });

  it('preserves other entries when updating', () => {
    const result = updateSessionRepeats({
      sessionRepeats: [
        { taskId: '1x1', dueAtTaskNum: 5 },
        { taskId: '7x8', dueAtTaskNum: 6 },
      ],
      taskId: '7x8',
      wasCorrect: true,
      currentTaskNum: 7,
    });
    expect(result).toHaveLength(1);
    expect(result[0].taskId).toBe('1x1');
  });

  it('does not mutate input array', () => {
    const original = [{ taskId: '7x8', dueAtTaskNum: 5 }];
    updateSessionRepeats({
      sessionRepeats: original,
      taskId: '7x8',
      wasCorrect: false,
      currentTaskNum: 10,
      randInt: () => 3,
    });
    expect(original).toHaveLength(1);
    expect(original[0].dueAtTaskNum).toBe(5);
  });
});

describe('ensureAllSmallTableTasks', () => {
  it('fills empty map with all 81 tasks at box 1', () => {
    const result = ensureAllSmallTableTasks({});
    expect(Object.keys(result)).toHaveLength(81);
    for (const id of SMALL_TABLE_TASK_IDS) {
      expect(result[id]).toEqual({ attempts: 0, correct: 0, box: 1 });
    }
  });

  it('preserves existing task state', () => {
    const existing: Record<string, TaskState> = { '1x1': { attempts: 5, correct: 3, box: 3 } };
    const result = ensureAllSmallTableTasks(existing);
    expect(result['1x1']).toEqual({ attempts: 5, correct: 3, box: 3 });
  });

  it('fills missing box on existing task', () => {
    // Simulate data loaded from old localStorage (box missing at runtime)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing: Record<string, TaskState> = { '1x1': { attempts: 5, correct: 3 } as any };
    const result = ensureAllSmallTableTasks(existing);
    expect(result['1x1'].box).toBe(1);
  });

  it('does not mutate input object', () => {
    const original: Record<string, TaskState> = { '1x1': { attempts: 5, correct: 3, box: 3 } };
    ensureAllSmallTableTasks(original);
    expect(original).toEqual({ '1x1': { attempts: 5, correct: 3, box: 3 } });
  });

  it('returns all 81 tasks regardless of input size', () => {
    const partial: Record<string, TaskState> = {
      '1x1': { attempts: 1, correct: 1, box: 2 },
      '9x9': { attempts: 2, correct: 0, box: 1 },
    };
    const result = ensureAllSmallTableTasks(partial);
    expect(Object.keys(result)).toHaveLength(81);
  });
});
