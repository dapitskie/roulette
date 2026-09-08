import type { RouletteConfig, RouletteEntry, SpinResult } from '../types/roulette';

const STORAGE_KEYS = {
  ENTRIES: 'custom_roulette_entries_v1',
  CONFIG: 'custom_roulette_config_v1',
  HISTORY: 'custom_roulette_history_v1',
};

export const DEFAULT_ENTRIES: RouletteEntry[] = [
  { id: '1', label: 'Kevin' },
  { id: '2', label: 'Ray' },
  { id: '3', label: 'David' },
  { id: '4', label: 'Andi' },
  { id: '5', label: 'Budi' },
  { id: '6', label: 'Caca' },
];

export const DEFAULT_CONFIG: RouletteConfig = {
  mode: 'random',
  targetId: '1', // default Kevin
  speedDuration: 7, // 7 seconds default
  winnerCount: 1, // 1 winner default
  removeWinner: false,
  soundEnabled: true,
  confettiEnabled: true,
  theme: 'vibrant',
};

export function loadEntries(): RouletteEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!data) return DEFAULT_ENTRIES;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ENTRIES;
  } catch {
    return DEFAULT_ENTRIES;
  }
}

export function saveEntries(entries: RouletteEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save entries to localStorage', e);
  }
}

export function loadConfig(): RouletteConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!data) return DEFAULT_CONFIG;
    const parsed = JSON.parse(data);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: RouletteConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config to localStorage', e);
  }
}

export function loadHistory(): SpinResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: SpinResult[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
}
