export type WaveformType = 'sine' | 'triangle' | 'sawtooth' | 'square';

export interface ThemeColors {
  accent: string;
  glow: string;
  muted: string;
  bgDeep: string;
}

export const WAVEFORM_THEMES: Record<WaveformType, ThemeColors> = {
  sine: {
    accent: '#22d3ee', // cyan-400
    glow: 'rgba(34, 211, 238, 0.4)',
    muted: 'rgba(34, 211, 238, 0.1)',
    bgDeep: '#021a1d',
  },
  triangle: {
    accent: '#4ade80', // green-400
    glow: 'rgba(74, 222, 128, 0.4)',
    muted: 'rgba(74, 222, 128, 0.1)',
    bgDeep: '#041d0f',
  },
  sawtooth: {
    accent: '#fbbf24', // amber-400
    glow: 'rgba(251, 191, 36, 0.4)',
    muted: 'rgba(251, 191, 36, 0.1)',
    bgDeep: '#1d1502',
  },
  square: {
    accent: '#f87171', // red-400
    glow: 'rgba(248, 113, 113, 0.4)',
    muted: 'rgba(248, 113, 113, 0.1)',
    bgDeep: '#1d0202',
  },
};

export const NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

export const getNoteName = (midi: number) => {
  const name = NOTES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
};
