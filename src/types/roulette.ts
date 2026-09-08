export interface RouletteEntry {
  id: string;
  label: string;
  weight?: number;
  color?: string;
}

export type SpinMode = 'random' | 'target';

export interface RouletteConfig {
  mode: SpinMode;
  targetId: string | null;
  speedDuration: number; // in seconds, default 7 (range 2 - 15)
  winnerCount: number; // number of winners drawn per spin, default 1
  removeWinner: boolean;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  theme: 'vibrant' | 'pastel' | 'neon' | 'sunset';
}

export interface WinnerItem {
  id: string;
  name: string;
  rank: number;
}

export interface SpinResult {
  id: string;
  entryId: string;
  entryName: string;
  winners?: WinnerItem[]; // List of all winners if winnerCount > 1
  mode: SpinMode;
  timestamp: number;
}
