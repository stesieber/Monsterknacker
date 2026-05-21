import type { LeitnerBox, MonsterType, CreatureKind } from '../types/index';
import { MONSTER_TYPE_COUNT } from '../types/index';

export function kindForBox(box: LeitnerBox): CreatureKind {
  if (box === 5) return 'gold';
  if (box === 4) return 'silver';
  return 'monster';
}

export function randomMonsterType(): MonsterType {
  return Math.floor(Math.random() * MONSTER_TYPE_COUNT) as MonsterType;
}
