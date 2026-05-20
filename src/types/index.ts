export interface AppData {
  version: number;
  activeProfileId: string | null;
  profiles: Profile[];
}

export interface Profile {
  id: string;
  name: string;
  emoji: string;
  createdAt: number;
  settings?: ProfileSettings;
  tasks?: Record<string, unknown>;
  stats?: Record<string, unknown>;
}

export interface ProfileSettings {
  showVisualization: boolean;
}

export const AVAILABLE_EMOJIS = [
  '🐶', '🐱', '🐰', '🦊', '🐼', '🦁', '🐸', '🐵',
  '🦄', '🐲', '🦖', '🐙', '🦋', '🐝', '🦔', '🐢',
  '🌟', '🚀', '⚽', '🎨', '🎮', '🍕', '🌈', '🔥',
] as const;

export type AvailableEmoji = (typeof AVAILABLE_EMOJIS)[number];
