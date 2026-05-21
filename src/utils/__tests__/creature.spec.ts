import { describe, it, expect } from 'vitest';
import { kindForBox, randomMonsterType } from '../creature';

describe('kindForBox', () => {
  it('returns monster for boxes 1–3', () => {
    expect(kindForBox(1)).toBe('monster');
    expect(kindForBox(2)).toBe('monster');
    expect(kindForBox(3)).toBe('monster');
  });

  it('returns silver for box 4', () => {
    expect(kindForBox(4)).toBe('silver');
  });

  it('returns gold for box 5', () => {
    expect(kindForBox(5)).toBe('gold');
  });
});

describe('randomMonsterType', () => {
  it('returns only 0, 1, or 2', () => {
    for (let i = 0; i < 100; i++) {
      const t = randomMonsterType();
      expect([0, 1, 2]).toContain(t);
    }
  });

  it('distributes roughly evenly over 1000 calls', () => {
    const counts = [0, 0, 0];
    for (let i = 0; i < 1000; i++) counts[randomMonsterType()]++;
    for (const count of counts) {
      expect(count).toBeGreaterThan(200);
      expect(count).toBeLessThan(600);
    }
  });
});
