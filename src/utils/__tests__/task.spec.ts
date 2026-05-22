import { describe, it, expect } from 'vitest';
import {
  createMulTask,
  createDivTask,
  operationForId,
  parseTaskId,
  allMulTaskIds,
  allDivTaskIds,
  taskIdsForConfig,
} from '../task';

describe('createMulTask', () => {
  it('7 × 8 → {id, operation, answer, display}', () => {
    const t = createMulTask(7, 8);
    expect(t.id).toBe('7x8');
    expect(t.operation).toBe('mul');
    expect(t.a).toBe(7);
    expect(t.b).toBe(8);
    expect(t.answer).toBe(56);
    expect(t.display).toBe('7 × 8');
  });

  it('9 × 20 → answer 180, display "9 × 20"', () => {
    const t = createMulTask(9, 20);
    expect(t.answer).toBe(180);
    expect(t.display).toBe('9 × 20');
  });
});

describe('createDivTask', () => {
  it('7, 8 → 56 ÷ 7, answer 8', () => {
    const t = createDivTask(7, 8);
    expect(t.id).toBe('56÷7');
    expect(t.operation).toBe('div');
    expect(t.a).toBe(7);
    expect(t.b).toBe(8);
    expect(t.answer).toBe(8);
    expect(t.display).toBe('56 ÷ 7');
  });

  it('8, 7 → 56 ÷ 8, answer 7 (verschieden von 7,8)', () => {
    const t = createDivTask(8, 7);
    expect(t.id).toBe('56÷8');
    expect(t.answer).toBe(7);
    expect(t.display).toBe('56 ÷ 8');
  });

  it('9, 20 → 180 ÷ 9, answer 20', () => {
    const t = createDivTask(9, 20);
    expect(t.id).toBe('180÷9');
    expect(t.answer).toBe(20);
    expect(t.display).toBe('180 ÷ 9');
  });
});

describe('operationForId', () => {
  it('"7x8" → mul', () => {
    expect(operationForId('7x8')).toBe('mul');
  });
  it('"56÷7" → div', () => {
    expect(operationForId('56÷7')).toBe('div');
  });
  it('Wirft bei unbekanntem Format', () => {
    expect(() => operationForId('abc')).toThrow();
  });
});

describe('parseTaskId', () => {
  it('parst "7x8" als Mul', () => {
    const t = parseTaskId('7x8');
    expect(t.operation).toBe('mul');
    expect(t.a).toBe(7);
    expect(t.b).toBe(8);
    expect(t.answer).toBe(56);
  });

  it('parst "56÷7" als Div', () => {
    const t = parseTaskId('56÷7');
    expect(t.operation).toBe('div');
    expect(t.a).toBe(7);
    expect(t.b).toBe(8);
    expect(t.answer).toBe(8);
    expect(t.display).toBe('56 ÷ 7');
  });

  it('parst "180÷9" als Div', () => {
    const t = parseTaskId('180÷9');
    expect(t.a).toBe(9);
    expect(t.b).toBe(20);
    expect(t.answer).toBe(20);
  });

  it('wirft bei ungültigem Format', () => {
    expect(() => parseTaskId('foo')).toThrow();
    expect(() => parseTaskId('5÷0')).toThrow();
    expect(() => parseTaskId('7÷3')).toThrow(); // nicht ganzzahlig
  });
});

describe('allMulTaskIds / allDivTaskIds', () => {
  it('allMulTaskIds gibt 180 eindeutige IDs', () => {
    const ids = allMulTaskIds();
    expect(ids).toHaveLength(180);
    expect(new Set(ids).size).toBe(180);
    expect(ids).toContain('1x1');
    expect(ids).toContain('9x20');
  });

  it('allDivTaskIds gibt 180 eindeutige IDs', () => {
    const ids = allDivTaskIds();
    expect(ids).toHaveLength(180);
    expect(new Set(ids).size).toBe(180);
    expect(ids).toContain('1÷1');
    expect(ids).toContain('180÷9');
    expect(ids).toContain('56÷7');
  });
});

describe('taskIdsForConfig — alle 4 Kombinationen', () => {
  it('mul/small → 81 IDs (Form AxB, b≤9)', () => {
    const ids = taskIdsForConfig('mul', 'small');
    expect(ids).toHaveLength(81);
    for (const id of ids) {
      expect(id).toMatch(/^[1-9]x[1-9]$/);
    }
    expect(ids).toContain('1x1');
    expect(ids).toContain('9x9');
    expect(ids).not.toContain('1x10');
  });

  it('mul/large → 180 IDs (b≤20), enthält klein als Teilmenge', () => {
    const ids = taskIdsForConfig('mul', 'large');
    expect(ids).toHaveLength(180);
    const small = new Set(taskIdsForConfig('mul', 'small'));
    for (const id of small) expect(ids).toContain(id);
    expect(ids).toContain('9x20');
    expect(ids).toContain('7x13');
  });

  it('div/small → 81 IDs, divisor∈1..9, quotient∈1..9', () => {
    const ids = taskIdsForConfig('div', 'small');
    expect(ids).toHaveLength(81);
    for (const id of ids) {
      const match = /^(\d+)÷(\d+)$/.exec(id);
      expect(match).not.toBeNull();
      const dividend = Number(match![1]);
      const divisor = Number(match![2]);
      expect(divisor).toBeGreaterThanOrEqual(1);
      expect(divisor).toBeLessThanOrEqual(9);
      const quotient = dividend / divisor;
      expect(quotient).toBeGreaterThanOrEqual(1);
      expect(quotient).toBeLessThanOrEqual(9);
    }
  });

  it('div/large → 180 IDs, quotient∈1..20', () => {
    const ids = taskIdsForConfig('div', 'large');
    expect(ids).toHaveLength(180);
    expect(ids).toContain('180÷9');
    const small = new Set(taskIdsForConfig('div', 'small'));
    for (const id of small) expect(ids).toContain(id);
  });

  it('mul-Pool und div-Pool sind disjunkt', () => {
    const mul = new Set(taskIdsForConfig('mul', 'large'));
    const div = new Set(taskIdsForConfig('div', 'large'));
    for (const id of mul) expect(div.has(id)).toBe(false);
  });
});
