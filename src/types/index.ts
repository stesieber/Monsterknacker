/** Leitner-Fach 1–5. 1 = noch nicht beherrscht, 5 = beherrscht. */
export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

/** Index des Monster-Designs (0, 1 oder 2). Permanent pro Aufgabe. */
export type MonsterType = 0 | 1 | 2;

/** Was eine Aufgabe gerade visuell ist. Abgeleitet aus dem Leitner-Fach. */
export type CreatureKind = 'monster' | 'silver' | 'gold';

/** Anzahl verfügbarer Monster-Designs. */
export const MONSTER_TYPE_COUNT = 3;

/** Mathematische Operation einer Aufgabe. */
export type Operation = 'mul' | 'div';

/** Übungs-Umfang. */
export type Range = 'small' | 'large';

/** Anzeigenamen Operation. */
export const OPERATION_LABELS: Record<Operation, string> = {
  mul: 'Multiplikation',
  div: 'Division',
};

/** Operations-Symbol für die UI. */
export const OPERATION_SYMBOL: Record<Operation, string> = {
  mul: '×',
  div: '÷',
};

/** Anzeigenamen Umfang. */
export const RANGE_LABELS: Record<Range, string> = {
  small: '1×1 klein (bis 9)',
  large: '1×1 gross (bis 20)',
};

export interface TaskState {
  attempts: number;
  correct: number;
  lastAttemptAt?: number;
  box: LeitnerBox;
  monsterType: MonsterType;
}

/** Rückgabe von recordTaskAttempt: enthält Info über Box-Übergang. */
export interface AttemptResult {
  previousKind: CreatureKind;
  newKind: CreatureKind;
  /** True wenn newKind != previousKind und newKind nicht 'monster'. */
  promotedToHero: boolean;
}

export type TaskMap = Record<string, TaskState>;

/** Eine Aufgabe (Mul oder Div). Nicht persistiert. */
export interface Task {
  /** Eindeutige ID, z.B. "7x8" (Mul) oder "56÷7" (Div). */
  id: string;
  operation: Operation;
  /** Bei Mul: erster Faktor (1..9). Bei Div: Divisor (1..9). */
  a: number;
  /** Bei Mul: zweiter Faktor (1..20). Bei Div: Quotient (1..20). */
  b: number;
  /** Korrekte Antwort. Mul: a*b. Div: b (der gesuchte Faktor). */
  answer: number;
  /** Anzeige-String, z.B. "7 × 8" oder "56 ÷ 7". */
  display: string;
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
  /** Pflichtfeld seit Iter. 7. */
  operation: Operation;
  /** Pflichtfeld seit Iter. 7. */
  range: Range;
}

export interface ProfileSettings {
  showVisualization: boolean;
  /** Letzte gewählte Konfiguration — für vorausgefüllten ModeSelector. */
  lastSessionMode?: SessionMode;
  lastSessionDifficulty?: Difficulty;
  lastSessionOperation?: Operation;
  lastSessionRange?: Range;
}

export interface ProfileStats {
  /** Kumulierte Trainings-Übungszeit in Millisekunden. Freier Modus zählt NICHT mit. */
  totalPracticeMs: number;
  /** Anzahl abgeschlossener Sessions (beide Modi). Optional, ab Iter. 8. */
  sessionsCount?: number;
  /** Unix-Timestamp (ms) der letzten beendeten Session. Optional. */
  lastSessionAt?: number;
}

/** Eine Aufgabe mit aufbereiteten Kennzahlen für die Statistik-Ansicht. */
export interface TaskStat {
  taskId: string;
  operation: Operation;
  a: number;
  b: number;
  /** Fertiger Anzeige-String aus dem Task, z.B. «7 × 8» oder «56 ÷ 7». */
  display: string;
  box: LeitnerBox;
  attempts: number;
  correct: number;
  monsterType: MonsterType;
  /** correct / attempts, oder null wenn attempts === 0. */
  successRate: number | null;
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

/** Farb-Slot eines Blocks in der Rechteck-Visualisierung.
 *  Erstes Zeichen: a-Achse (F=5er, R=Rest, a ∈ 1..9 hat keinen 10er).
 *  Zweites Zeichen: b-Achse (T=10er, F=5er, R=Rest). */
export type ColorSlot = 'FF' | 'FR' | 'RF' | 'RR' | 'FT' | 'RT';

/** A colored block in the rectangle area model. */
export interface VisualizationBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  colorSlot: ColorSlot;
  label: number;
}

export const AVAILABLE_EMOJIS = [
  '🐶', '🐱', '🐰', '🦊', '🐼', '🦁', '🐸', '🐵',
  '🦄', '🐲', '🦖', '🐙', '🦋', '🐝', '🦔', '🐢',
  '🌟', '🚀', '⚽', '🎨', '🎮', '🍕', '🌈', '🔥',
] as const;

export type AvailableEmoji = (typeof AVAILABLE_EMOJIS)[number];
