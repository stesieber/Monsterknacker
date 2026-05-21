import { describe, it, expect } from 'vitest';
import { useVisualization } from '../useVisualization';

const { partition } = useVisualization();

describe('partition', () => {
  it('7 × 8 → 4 blocks A:25 B:10 C:15 D:6', () => {
    const blocks = partition(7, 8);
    expect(blocks).toHaveLength(4);
    expect(blocks.find((b) => b.colorSlot === 'A')?.label).toBe(25);
    expect(blocks.find((b) => b.colorSlot === 'B')?.label).toBe(10);
    expect(blocks.find((b) => b.colorSlot === 'C')?.label).toBe(15);
    expect(blocks.find((b) => b.colorSlot === 'D')?.label).toBe(6);
  });

  it('5 × 7 → 2 blocks A:25 C:10', () => {
    const blocks = partition(5, 7);
    expect(blocks).toHaveLength(2);
    expect(blocks.find((b) => b.colorSlot === 'A')?.label).toBe(25);
    expect(blocks.find((b) => b.colorSlot === 'C')?.label).toBe(10);
  });

  it('7 × 5 → 2 blocks A:25 B:10', () => {
    const blocks = partition(7, 5);
    expect(blocks).toHaveLength(2);
    expect(blocks.find((b) => b.colorSlot === 'A')?.label).toBe(25);
    expect(blocks.find((b) => b.colorSlot === 'B')?.label).toBe(10);
  });

  it('5 × 5 → 1 block A:25', () => {
    const blocks = partition(5, 5);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].colorSlot).toBe('A');
    expect(blocks[0].label).toBe(25);
  });

  it('3 × 4 → 1 block D:12', () => {
    const blocks = partition(3, 4);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].colorSlot).toBe('D');
    expect(blocks[0].label).toBe(12);
  });

  it('9 × 9 → 4 blocks A:25 B:20 C:20 D:16', () => {
    const blocks = partition(9, 9);
    expect(blocks).toHaveLength(4);
    expect(blocks.find((b) => b.colorSlot === 'A')?.label).toBe(25);
    expect(blocks.find((b) => b.colorSlot === 'B')?.label).toBe(20);
    expect(blocks.find((b) => b.colorSlot === 'C')?.label).toBe(20);
    expect(blocks.find((b) => b.colorSlot === 'D')?.label).toBe(16);
  });

  it('1 × 1 → 1 block D:1', () => {
    const blocks = partition(1, 1);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].colorSlot).toBe('D');
    expect(blocks[0].label).toBe(1);
  });

  it('9 × 1 → 2 blocks C:5 D:4', () => {
    const blocks = partition(9, 1);
    expect(blocks).toHaveLength(2);
    expect(blocks.find((b) => b.colorSlot === 'C')?.label).toBe(5);
    expect(blocks.find((b) => b.colorSlot === 'D')?.label).toBe(4);
  });

  it('1 × 9 → 2 blocks B:5 D:4', () => {
    const blocks = partition(1, 9);
    expect(blocks).toHaveLength(2);
    expect(blocks.find((b) => b.colorSlot === 'B')?.label).toBe(5);
    expect(blocks.find((b) => b.colorSlot === 'D')?.label).toBe(4);
  });

  it('block labels sum to the product', () => {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        const sum = partition(a, b).reduce((acc, bl) => acc + bl.label, 0);
        expect(sum).toBe(a * b);
      }
    }
  });
});
