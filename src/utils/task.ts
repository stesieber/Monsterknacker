import type { Task } from '../types/index';

/** Erzeugt ein Task-Objekt aus zwei Faktoren. */
export function createTask(a: number, b: number): Task {
  return { id: `${a}x${b}`, a, b, answer: a * b };
}

/** Parst eine Aufgaben-ID. Wirft, falls Format ungültig. */
export function parseTaskId(id: string): Task {
  const match = /^(\d+)x(\d+)$/.exec(id);
  if (!match) throw new Error(`Ungültige Aufgaben-ID: ${id}`);
  const a = Number(match[1]);
  const b = Number(match[2]);
  return createTask(a, b);
}
