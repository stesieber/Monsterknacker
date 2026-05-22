import { describe, it, expect } from 'vitest';
import { decompose, partition } from '../visualization';

describe('decompose', () => {
  it('factors 1..9 return single segment (or 5+rest)', () => {
    expect(decompose(1)).toEqual([1]);
    expect(decompose(3)).toEqual([3]);
    expect(decompose(5)).toEqual([5]);
    expect(decompose(7)).toEqual([5, 2]);
    expect(decompose(9)).toEqual([5, 4]);
  });

  it('factor 10 → single 10er', () => {
    expect(decompose(10)).toEqual([10]);
  });

  it('factor 11 → 10er + 1', () => {
    expect(decompose(11)).toEqual([10, 1]);
  });

  it('factor 17 → 10er + 5er + 2', () => {
    expect(decompose(17)).toEqual([10, 5, 2]);
  });

  it('factor 20 → zwei 10er', () => {
    expect(decompose(20)).toEqual([10, 10]);
  });

  it('factor 13 → 10er + 3', () => {
    expect(decompose(13)).toEqual([10, 3]);
  });

  it('factor 15 → 10er + 5er', () => {
    expect(decompose(15)).toEqual([10, 5]);
  });
});

describe('partition (1..9 — kompatibel zu Iter. 5)', () => {
  it('7 × 8 → 4 Blöcke FF:25 RF:10 FR:15 RR:6', () => {
    const blocks = partition(7, 8);
    expect(blocks).toHaveLength(4);
    expect(blocks.find((b) => b.colorSlot === 'FF')?.label).toBe(25);
    expect(blocks.find((b) => b.colorSlot === 'RF')?.label).toBe(10);
    expect(blocks.find((b) => b.colorSlot === 'FR')?.label).toBe(15);
    expect(blocks.find((b) => b.colorSlot === 'RR')?.label).toBe(6);
  });

  it('5 × 5 → 1 Block FF:25', () => {
    const blocks = partition(5, 5);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].colorSlot).toBe('FF');
    expect(blocks[0].label).toBe(25);
  });

  it('3 × 4 → 1 Block RR:12', () => {
    const blocks = partition(3, 4);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].colorSlot).toBe('RR');
    expect(blocks[0].label).toBe(12);
  });

  it('9 × 9 → 4 Blöcke FF:25 RF:20 FR:20 RR:16', () => {
    const blocks = partition(9, 9);
    expect(blocks).toHaveLength(4);
    expect(blocks.find((b) => b.colorSlot === 'FF')?.label).toBe(25);
    expect(blocks.find((b) => b.colorSlot === 'RF')?.label).toBe(20);
    expect(blocks.find((b) => b.colorSlot === 'FR')?.label).toBe(20);
    expect(blocks.find((b) => b.colorSlot === 'RR')?.label).toBe(16);
  });

  it('Block-Labels addieren sich zum Produkt (1..9)', () => {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        const sum = partition(a, b).reduce((acc, bl) => acc + bl.label, 0);
        expect(sum).toBe(a * b);
      }
    }
  });
});

describe('partition (mit 10er-Block — neu in Iter. 7)', () => {
  it('7 × 13 → 4 Blöcke (50, 20, 15, 6)', () => {
    const blocks = partition(7, 13);
    expect(blocks).toHaveLength(4);
    const labels = blocks.map((b) => b.label).sort((a, b) => a - b);
    expect(labels).toEqual([6, 15, 20, 50]);
    // Spezifische Slot-Zuordnung
    expect(blocks.find((b) => b.colorSlot === 'FT')?.label).toBe(50); // 5×10
    expect(blocks.find((b) => b.colorSlot === 'RT')?.label).toBe(20); // 2×10
    expect(blocks.find((b) => b.colorSlot === 'FR')?.label).toBe(15); // 5×3
    expect(blocks.find((b) => b.colorSlot === 'RR')?.label).toBe(6);  // 2×3
  });

  it('9 × 20 → 4 Blöcke (50, 40, 50, 40)', () => {
    const blocks = partition(9, 20);
    expect(blocks).toHaveLength(4);
    const labels = blocks.map((b) => b.label).sort((a, b) => a - b);
    expect(labels).toEqual([40, 40, 50, 50]);
    expect(blocks.reduce((s, b) => s + b.label, 0)).toBe(180);
  });

  it('6 × 17 → 6 Blöcke (50, 10, 25, 5, 10, 2)', () => {
    const blocks = partition(6, 17);
    expect(blocks).toHaveLength(6);
    const labels = blocks.map((b) => b.label).sort((a, b) => a - b);
    expect(labels).toEqual([2, 5, 10, 10, 25, 50]);
  });

  it('4 × 11 → 2 Blöcke (40 RT, 4 RR)', () => {
    const blocks = partition(4, 11);
    expect(blocks).toHaveLength(2);
    expect(blocks.find((b) => b.colorSlot === 'RT')?.label).toBe(40);
    expect(blocks.find((b) => b.colorSlot === 'RR')?.label).toBe(4);
  });

  it('8 × 15 → 4 Blöcke (50, 30, 25, 15)', () => {
    const blocks = partition(8, 15);
    expect(blocks).toHaveLength(4);
    const labels = blocks.map((b) => b.label).sort((a, b) => a - b);
    expect(labels).toEqual([15, 25, 30, 50]);
  });

  it('5 × 12 → 2 Blöcke (50 FT, 10 FR)', () => {
    const blocks = partition(5, 12);
    expect(blocks).toHaveLength(2);
    expect(blocks.find((b) => b.colorSlot === 'FT')?.label).toBe(50);
    expect(blocks.find((b) => b.colorSlot === 'FR')?.label).toBe(10);
  });

  it('Block-Labels addieren sich zum Produkt für a∈1..9, b∈1..20', () => {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 20; b++) {
        const sum = partition(a, b).reduce((acc, bl) => acc + bl.label, 0);
        expect(sum).toBe(a * b);
      }
    }
  });
});
