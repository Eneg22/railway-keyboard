import React from 'react';
import { WaveformType, WAVEFORM_THEMES } from '../constants';

interface FooterProps {
  waveform: WaveformType;
  setWaveform: (w: WaveformType) => void;
  activeNote?: string;
}

export const Footer: React.FC<FooterProps> = ({ waveform, setWaveform, activeNote }) => {
  const theme = WAVEFORM_THEMES[waveform];

  const types: { id: WaveformType; label: string; path: string }[] = [
    { id: 'sine', label: 'Sine', path: 'M0 8 C 4 0, 12 0, 16 8 S 28 16, 32 8' },
    { id: 'triangle', label: 'Triangle', path: 'M0 8 L 8 0 L 24 16 L 32 8' },
    { id: 'sawtooth', label: 'Saw', path: 'M0 16 L 16 0 V 16 L 32 0' },
    { id: 'square', label: 'Square', path: 'M0 16 H 8 V 0 H 24 V 16 H 32' },
  ];

  return (
    <footer className="h-24 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-center gap-8 relative shrink-0">
      {types.map((t) => {
        const isActive = waveform === t.id;
        const currentTheme = WAVEFORM_THEMES[t.id];
        
        return (
          <button 
            key={t.id}
            onClick={() => setWaveform(t.id)}
            className={`flex flex-col items-center gap-2 transition-all duration-300 ${
              isActive ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'
            }`}
            id={`btn-wave-${t.id}`}
          >
            <div 
              className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all duration-500`}
              style={{ 
                borderColor: isActive ? currentTheme.accent : 'rgba(255,255,255,0.1)',
                backgroundColor: isActive ? currentTheme.muted : 'rgba(255,255,255,0.05)',
                boxShadow: isActive ? `0 0 15px ${currentTheme.glow}` : 'none'
              }}
            >
              <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                 <path 
                    d={t.path} 
                    stroke="currentColor" 
                    style={{ color: isActive ? currentTheme.accent : 'white' }}
                    strokeWidth="2" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                 />
              </svg>
            </div>
            <span 
              className="text-[10px] tracking-widest font-bold uppercase transition-colors"
              style={{ color: isActive ? currentTheme.accent : 'rgba(255,255,255,0.4)' }}
            >
              {t.label}
            </span>
          </button>
        );
      })}

      {/* Playback Info */}
      <div className="absolute left-8 flex items-center gap-4">
        <div 
          className="w-2 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,255,255,1)]"
          style={{ 
            backgroundColor: theme.accent,
            boxShadow: `0 0 8px ${theme.accent}`
          }}
        />
        <span className="text-[10px] uppercase tracking-widest text-white/60">
          Timbre: {waveform.toUpperCase()} WAVE {activeNote ? `(${activeNote} ACTIVE)` : ''}
        </span>
      </div>
    </footer>
  );
};
