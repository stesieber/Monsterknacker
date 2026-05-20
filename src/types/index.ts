export interface TaskState {
  attempts: number;
  correct: number;
  lastAttemptAt?: number;
  box?: number;
  monsterType?: number;
}

export type TaskMap = Record<string, TaskState>;

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
