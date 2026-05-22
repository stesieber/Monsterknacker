import type { Operation, Range, Task } from '../types/index';

/** Erzeugt eine Multiplikations-Aufgabe.
 *  a ∈ 1..9 (erster Faktor), b ∈ 1..20 (zweiter Faktor). */
export function createMulTask(a: number, b: number): Task {
  return {
    id: `${a}x${b}`,
    operation: 'mul',
    a,
    b,
    answer: a * b,
    display: `${a} × ${b}`,
  };
}

/** Erzeugt eine Divisions-Aufgabe.
 *  divisor = a (1..9), quotient = b (1..20). Dividend = a*b. */
export function createDivTask(a: number, b: number): Task {
  const dividend = a * b;
  return {
    id: `${dividend}÷${a}`,
    operation: 'div',
    a,
    b,
    answer: b,
    display: `${dividend} ÷ ${a}`,
  };
}

/** Erkennt die Operation einer ID am Trennzeichen. */
export function operationForId(id: string): Operation {
  if (id.includes('÷')) return 'div';
  if (id.includes('x')) return 'mul';
  throw new Error(`Ungültige Aufgaben-ID: ${id}`);
}

/** Abwärtskompatible Factory: erzeugt eine Mul-Aufgabe.
 *  Bleibt für Bestandscode aus Iter. 1–6 erhalten. */
export function createTask(a: number, b: number): Task {
  return createMulTask(a, b);
}

/** Parst eine Aufgaben-ID. Wirft, falls Format ungültig. */
export function parseTaskId(id: string): Task {
  const mulMatch = /^(\d+)x(\d+)$/.exec(id);
  if (mulMatch) return createMulTask(Number(mulMatch[1]), Number(mulMatch[2]));

  const divMatch = /^(\d+)÷(\d+)$/.exec(id);
  if (divMatch) {
    const dividend = Number(divMatch[1]);
    const divisor = Number(divMatch[2]);
    if (divisor === 0 || dividend % divisor !== 0) {
      throw new Error(`Ungültige Div-Aufgaben-ID: ${id}`);
    }
    return createDivTask(divisor, dividend / divisor);
  }

  throw new Error(`Ungültige Aufgaben-ID: ${id}`);
}

/** Alle 180 Mul-IDs (a∈1..9, b∈1..20). */
export function allMulTaskIds(): string[] {
  const ids: string[] = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 20; b++) ids.push(`${a}x${b}`);
  }
  return ids;
}

/** Alle 180 Div-IDs (Divisor 1..9, Quotient 1..20). */
export function allDivTaskIds(): string[] {
  const ids: string[] = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 20; b++) ids.push(`${a * b}÷${a}`);
  }
  return ids;
}

/** IDs des aktiven Pools für eine SessionConfig. */
export function taskIdsForConfig(operation: Operation, range: Range): string[] {
  const bMax = range === 'small' ? 9 : 20;
  const ids: string[] = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= bMax; b++) {
      ids.push(operation === 'mul' ? `${a}x${b}` : `${a * b}÷${a}`);
    }
  }
  return ids;
}
