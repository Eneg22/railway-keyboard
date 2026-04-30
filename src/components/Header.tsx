import React from 'react';
import { WaveformType, WAVEFORM_THEMES } from '../constants';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  waveform: WaveformType;
  setWaveform?: (w: WaveformType) => void;
  octaveOffset: number;
  setOctaveOffset: (o: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  scrollVelocity: number;
  setScrollVelocity: (v: number) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  waveform,
  octaveOffset,
  setOctaveOffset,
  volume,
  setVolume,
  scrollVelocity,
  setScrollVelocity,
  onReset,
}) => {
  const theme = WAVEFORM_THEMES[waveform];

  const velocityOptions = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0];

  return (
    <header className="h-20 shrink-0 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a] z-50">
      <div className="flex flex-col">
        <h1 
          className="text-xs font-bold tracking-[0.3em] uppercase transition-colors duration-500"
          style={{ color: theme.accent }}
        >
          RAILWAY KEYBOARD
        </h1>
        <h2 className="text-[10px] tracking-widest text-white/40 uppercase mt-1">
          MUSCOM ASSIGNMENT 3
        </h2>
      </div>
      
      <div className="flex items-center gap-10">
        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex flex-col items-center gap-1 group"
          title="Reset Keyboard (R)"
          id="btn-reset"
        >
          <span className="text-[9px] uppercase tracking-tighter text-white/30 group-hover:text-white/50 transition-colors">
            Reset
          </span>
          <div className="p-2 rounded border border-white/10 group-hover:bg-white/5 group-hover:border-white/20 transition-all">
            <RefreshCw className="w-4 h-4 text-white/50 group-hover:text-white group-active:rotate-180 transition-all duration-300" />
          </div>
        </button>

        {/* Velocity Control */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-tighter text-white/30 text-center">
            Velocity
          </span>
          <div className="flex border border-white/10 rounded overflow-hidden p-0.5 bg-white/5">
            {velocityOptions.map(v => (
              <button
                key={v}
                onClick={() => setScrollVelocity(v)}
                className={`text-[10px] px-2 py-1 rounded transition-all ${
                  scrollVelocity === v 
                    ? 'bg-white/20 text-white font-bold' 
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {v.toFixed(1)}x
              </button>
            ))}
          </div>
        </div>

        {/* Octave Transpose */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-tighter text-white/30 text-center">
            Octave Transpose
          </span>
          <div className="flex border border-white/10 rounded overflow-hidden">
            <button 
              onClick={() => setOctaveOffset(Math.max(-2, octaveOffset - 1))}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs border-r border-white/10 transition-colors"
              id="btn-octave-down"
            >
              -1
            </button>
            <div 
              className="px-4 py-1 text-xs font-bold transition-all duration-500 flex items-center justify-center min-w-[32px]"
              style={{ 
                backgroundColor: theme.muted,
                color: theme.accent 
              }}
            >
              {octaveOffset >= 0 ? `+${octaveOffset}` : octaveOffset}
            </div>
            <button 
              onClick={() => setOctaveOffset(Math.min(2, octaveOffset + 1))}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs transition-colors"
              id="btn-octave-up"
            >
              +1
            </button>
          </div>
        </div>

        {/* Master Volume */}
        <div className="flex flex-col gap-2">
          <span className="text-[9px] uppercase tracking-tighter text-white/30">
            Master Volume
          </span>
          <div className="w-48 h-1 bg-white/10 rounded-full relative group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="slider-volume"
            />
            <div 
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${volume * 100}%`,
                backgroundColor: theme.accent,
                boxShadow: `0 0 8px ${theme.glow}`
              }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 transition-all duration-300"
              style={{ 
                left: `${volume * 100}%`,
                borderColor: theme.accent,
                transform: `translate(-50%, -50%) scale(${volume > 0 ? 1 : 0.8})`
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
