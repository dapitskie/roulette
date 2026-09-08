export const COLOR_PALETTES = {
  vibrant: [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ],
  neon: [
    '#FF0055', // Neon Rose
    '#00F0FF', // Cyber Cyan
    '#FFE600', // Electric Yellow
    '#7928CA', // Deep Purple
    '#00FF66', // Neon Green
    '#FF00E5', // Neon Magenta
    '#FF5E00', // Neon Orange
    '#38EF7D', // Mint Neon
  ],
  pastel: [
    '#FCA5A5', // Pastel Red
    '#FDBA74', // Pastel Orange
    '#FDE047', // Pastel Yellow
    '#86EFAC', // Pastel Green
    '#67E8F9', // Pastel Cyan
    '#93C5FD', // Pastel Blue
    '#C4B5FD', // Pastel Purple
    '#F472B6', // Pastel Pink
  ],
  sunset: [
    '#F43F5E', // Rose
    '#FB7185', // Soft Rose
    '#E11D48', // Crimson
    '#BE123C', // Deep Crimson
    '#F59E0B', // Amber
    '#D97706', // Ochre
    '#9333EA', // Purple
    '#C026D3', // Fuchsia
  ],
};

export function getSegmentColor(index: number, theme: keyof typeof COLOR_PALETTES = 'vibrant'): string {
  const palette = COLOR_PALETTES[theme] || COLOR_PALETTES.vibrant;
  return palette[index % palette.length];
}
