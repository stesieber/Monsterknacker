/**
 * Tests for AttemptResult / promotedToHero logic in useProfiles.
 * Uses a real reactive state instance — each test resets it via createProfile.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useProfiles } from '../useProfiles';

// Suppress localStorage warnings in node env
Object.defineProperty(globalThis, 'localStorage', {
  value: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  writable: true,
});
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => Math.random().toString(36).slice(2) },
  writable: true,
});

function freshProfile() {
  const { createProfile, selectProfile } = useProfiles();
  const p = createProfile('Test', '🐶');
  selectProfile(p.id);
  return p;
}

describe('recordTaskAttempt — AttemptResult', () => {
  beforeEach(() => freshProfile());

  it('returns monster→monster for box 1 correct', () => {
    const { recordTaskAttempt } = useProfiles();
    const r = recordTaskAttempt('3x4', true);
    expect(r.previousKind).toBe('monster');
    expect(r.newKind).toBe('monster'); // box 1 → 2, still monster
    expect(r.promotedToHero).toBe(false);
  });

  it('returns monster→monster for any wrong answer', () => {
    const { recordTaskAttempt } = useProfiles();
    recordTaskAttempt('3x4', true); // → box 2
    recordTaskAttempt('3x4', true); // → box 3
    const r = recordTaskAttempt('3x4', false); // → box 1
    expect(r.newKind).toBe('monster');
    expect(r.promotedToHero).toBe(false);
  });

  it('promotes to silver (monster→silver) when box 3 answered correctly', () => {
    const { recordTaskAttempt } = useProfiles();
    recordTaskAttempt('5x6', true); // box 1→2
    recordTaskAttempt('5x6', true); // box 2→3
    const r = recordTaskAttempt('5x6', true); // box 3→4  ← promotion
    expect(r.previousKind).toBe('monster');
    expect(r.newKind).toBe('silver');
    expect(r.promotedToHero).toBe(true);
  });

  it('promotes to gold (silver→gold) when box 4 answered correctly', () => {
    const { recordTaskAttempt } = useProfiles();
    recordTaskAttempt('7x8', true); // 1→2
    recordTaskAttempt('7x8', true); // 2→3
    recordTaskAttempt('7x8', true); // 3→4 silver
    const r = recordTaskAttempt('7x8', true); // 4→5  ← gold promotion
    expect(r.previousKind).toBe('silver');
    expect(r.newKind).toBe('gold');
    expect(r.promotedToHero).toBe(true);
  });

  it('no promotion when gold stays gold (box 5 correct)', () => {
    const { recordTaskAttempt } = useProfiles();
    for (let i = 0; i < 4; i++) recordTaskAttempt('1x1', true); // → box 5
    const r = recordTaskAttempt('1x1', true); // stays box 5
    expect(r.previousKind).toBe('gold');
    expect(r.newKind).toBe('gold');
    expect(r.promotedToHero).toBe(false);
  });

  it('no promotion on wrong answer from hero box', () => {
    const { recordTaskAttempt } = useProfiles();
    for (let i = 0; i < 3; i++) recordTaskAttempt('2x3', true); // → box 4 silver
    const r = recordTaskAttempt('2x3', false); // box 4 → 1
    expect(r.previousKind).toBe('silver');
    expect(r.newKind).toBe('monster');
    expect(r.promotedToHero).toBe(false);
  });
});
