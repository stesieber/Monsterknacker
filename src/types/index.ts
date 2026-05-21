/** Leitner-Fach 1–5. 1 = noch nicht beherrscht, 5 = beherrscht. */
export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export interface TaskState {
  attempts: number;
  correct: number;
  lastAttemptAt?: number;
  box: LeitnerBox;
  monsterType?: number;
}

export type TaskMap = Record<string, TaskState>;

/** Eine Multiplikations-Aufgabe (nicht persistiert). */
export interface Task {
  id: string;
  a: number;
  b: number;
  answer: number;
}

/** Eintrag in der Session-internen Wiederholungs-Queue. */
export interface SessionRepeat {
  taskId: string;
  /** Bei welcher taskCount-Nummer soll diese Aufgabe erneut erscheinen. */
  dueAtTaskNum: number;
}

/** Auswahl-Gewichte je Fach (Box 1 dominiert). */
export const LEITNER_BOX_WEIGHTS: Record<LeitnerBox, number> = {
  1: 10,
  2: 6,
  3: 3,
  4: 2,
  5: 1,
};

/** Mindest- und Maximalabstand bei Session-interner Wiederholung. */
export const SESSION_REPEAT_MIN_GAP = 3;
export const SESSION_REPEAT_MAX_GAP = 5;

/** Vorberechnete Liste aller Aufgaben-IDs des kleinen 1×1 (81 Stück). */
export const SMALL_TABLE_TASK_IDS: readonly string[] = (() => {
  const ids: string[] = [];
  for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) ids.push(`${a}x${b}`);
  return ids;
})();

export interface AppData {
  version: number;
  activeProfileId: string | null;
  profiles: Profile[];
}

/** Session-Modi. */
export type SessionMode = 'free' | 'training';

/** Trainings-Schwierigkeitsstufen. */
export type Difficulty = 'easy' | 'medium' | 'expert';

/** Timeout pro Aufgabe in Millisekunden je Schwierigkeit. */
export const DIFFICULTY_TIMEOUT_MS: Record<Difficulty, number> = {
  easy: 15_000,
  medium: 8_000,
  expert: 4_000,
};

/** Anzeigenamen für die UI. */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Leicht',
  medium: 'Mittel',
  expert: 'Experte',
};

/** Session-Konfiguration, die an PracticeSession übergeben wird. */
export interface SessionConfig {
  mode: SessionMode;
  /** Nur gesetzt wenn mode === 'training'. */
  difficulty?: Difficulty;
}

export interface ProfileSettings {
  showVisualization: boolean;
  /** Letzte gewählte Konfiguration — für vorausgefüllten ModeSelector. */
  lastSessionMode?: SessionMode;
  lastSessionDifficulty?: Difficulty;
}

export interface ProfileStats {
  /** Kumulierte Trainings-Übungszeit in Millisekunden. Freier Modus zählt NICHT mit. */
  totalPracticeMs: number;
}

export interface Profile {
  id: string;
  name: string;
  emoji: string;
  createdAt: number;
  settings?: ProfileSettings;
  tasks?: TaskMap;
  stats?: ProfileStats;
}

export const AVAILABLE_EMOJIS = [
  '🐶', '🐱', '🐰', '🦊', '🐼', '🦁', '🐸', '🐵',
  '🦄', '🐲', '🦖', '🐙', '🦋', '🐝', '🦔', '🐢',
  '🌟', '🚀', '⚽', '🎨', '🎮', '🍕', '🌈', '🔥',
] as const;

export type AvailableEmoji = (typeof AVAILABLE_EMOJIS)[number];
