import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'motion/react';
import { WaveformType, WAVEFORM_THEMES, getNoteName } from '../constants';

interface RailwayKeyboardProps {
  waveform: WaveformType;
  octaveOffset: number;
  volume: number;
  scrollVelocity: number;
  resetTrigger: number;
  onActiveNoteChange: (note: string | undefined) => void;
}

const KEY_COUNT = 25;
const START_MIDI = 60; // C4

// Piano layout mapping: semitone index in octave -> white key "slot" position
const PIANO_LAYOUT = [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6];

export const RailwayKeyboard: React.FC<RailwayKeyboardProps> = ({
  waveform,
  octaveOffset,
  volume,
  scrollVelocity,
  resetTrigger,
  onActiveNoteChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // Initialize Audio
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: waveform },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  // Update Synth parameters
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({ oscillator: { type: waveform } });
    }
  }, [waveform]);

  const releaseAllNotes = () => {
    setActiveNotes(prev => {
      if (prev.size === 0) return prev;
      synthRef.current?.releaseAll();
      return new Set();
    });
  };

  // Handle stuck notes on unmount or parameter changes
  useEffect(() => {
    return () => {
      releaseAllNotes();
    };
  }, [waveform, octaveOffset]);

  // Global listeners to prevent stuck notes
  useEffect(() => {
    window.addEventListener('mouseup', releaseAllNotes);
    window.addEventListener('blur', releaseAllNotes);
    
    return () => {
      window.removeEventListener('mouseup', releaseAllNotes);
      window.removeEventListener('blur', releaseAllNotes);
    };
  }, []);

  // Reset handler
  useEffect(() => {
    if (resetTrigger > 0) {
      setScrollOffset(0);
      releaseAllNotes();
    }
  }, [resetTrigger]);

  useEffect(() => {
    Tone.Destination.volume.value = Tone.gainToDb(volume);
  }, [volume]);

  const [scrollOffset, setScrollOffset] = useState(0);
  const requestRef = useRef<number>(null);
  const previousTimeRef = useRef<number>(null);

  // Animation loop for scrolling
  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - (previousTimeRef.current || time);
        // Approximately 60 pixels per second scroll speed (base)
        setScrollOffset(prev => prev + deltaTime * 0.06 * scrollVelocity);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [scrollVelocity]);

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const waveformFunction = (t: number): number => {
    switch (waveform) {
      case 'sine':
        return Math.sin(t);
      case 'triangle':
        return (2 / Math.PI) * Math.asin(Math.sin(t));
      case 'sawtooth':
        // Standard sawtooth: (t % 2PI) / PI - 1
        return (t % (2 * Math.PI)) / Math.PI - 1;
      case 'square':
        return Math.sin(t) >= 0 ? 1 : -1;
      default:
        return 0;
    }
  };

  const derivativeFunction = (t: number): number => {
    const delta = 0.001;
    return (waveformFunction(t + delta) - waveformFunction(t)) / delta;
  };

  const railPath = useMemo(() => {
    if (dimensions.width === 0) return '';
    const availableWidth = dimensions.width;
    const centerY = dimensions.height / 2;
    const amplitude = Math.min(dimensions.height / 15, 50); // Factor 3 smaller
    const resolution = 200;

    let path = '';
    for (let i = 0; i <= resolution; i++) {
      const ratio = i / resolution;
      const t = ratio * 4 * Math.PI;
      const x = ratio * availableWidth;
      const y = centerY - waveformFunction(t) * amplitude;
      path += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
    }
    return path;
  }, [dimensions, waveform]);

  const keys = useMemo(() => {
    if (dimensions.width === 0) return [];

    const availableWidth = dimensions.width;
    const centerY = dimensions.height / 2;
    const amplitude = Math.min(dimensions.height / 15, 50); // Factor 3 smaller

    // Spacing keys closely to connect them like a train
    const whiteKeyWidth = 40; 
    
    // total units: (octaves * 7) + fraction
    const totalUnits = (Math.floor((KEY_COUNT - 1) / 12) * 7) + PIANO_LAYOUT[(KEY_COUNT - 1) % 12];
    const totalTrainLength = totalUnits * whiteKeyWidth;
    
    // We wrap relative to the screen width plus a bit of padding to let them go "off-screen"
    const wrapPadding = whiteKeyWidth * 4;
    const loopWidth = Math.max(availableWidth + wrapPadding, totalTrainLength + wrapPadding);

    return Array.from({ length: KEY_COUNT }).map((_, i) => {
      const midiIndexInOctave = i % 12;
      const octaveIndex = Math.floor(i / 12);
      const units = octaveIndex * 7 + PIANO_LAYOUT[midiIndexInOctave];
      const baseX = units * whiteKeyWidth;
      
      // Move Left to Right
      const currentX = ((baseX + scrollOffset) % loopWidth) - wrapPadding / 2;
      
      // Calculate ratio for waveform lookup
      const ratio = currentX / Math.max(availableWidth, 1);
      const t = ratio * 4 * Math.PI;
      const y = centerY - waveformFunction(t) * amplitude;
      
      // Calculate tangential angle
      const deltaT = 0.01;
      const tPrev = t - deltaT;
      const tNext = t + deltaT;
      
      const yPrev = centerY - waveformFunction(tPrev) * amplitude;
      const yNext = centerY - waveformFunction(tNext) * amplitude;
      const xPrev = (tPrev / (4 * Math.PI)) * availableWidth;
      const xNext = (tNext / (4 * Math.PI)) * availableWidth;
      
      const angle = Math.atan2(yNext - yPrev, xNext - xPrev) * (180 / Math.PI);

      const midi = START_MIDI + i + octaveOffset * 12;
      const isSharp = [1, 3, 6, 8, 10].includes(midi % 12);

      return { x: currentX, y, angle, midi, isSharp, t };
    });
  }, [dimensions, waveform, octaveOffset, scrollOffset]);

  const playNote = (midi: number) => {
    if (!Tone.context.state || Tone.context.state !== 'running') {
      Tone.start();
    }
    const note = getNoteName(midi);
    synthRef.current?.triggerAttack(note);
    setActiveNotes(prev => new Set(prev).add(midi));
  };

  const releaseNote = (midi: number) => {
    const note = getNoteName(midi);
    synthRef.current?.triggerRelease(note);
    setActiveNotes(prev => {
      if (!prev.has(midi)) return prev;
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  };

  // Sync activeNote with parent safely
  useEffect(() => {
    if (activeNotes.size > 0) {
      const lastMidi = Array.from(activeNotes).pop();
      if (lastMidi !== undefined) {
        onActiveNoteChange(getNoteName(lastMidi));
      }
    } else {
      onActiveNoteChange(undefined);
    }
  }, [activeNotes, onActiveNoteChange]);

  const theme = WAVEFORM_THEMES[waveform];

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ backgroundColor: theme.bgDeep }}>
      {/* Background Rail Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <path
          d={railPath}
          fill="none"
          stroke={theme.accent}
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.1"
          className="transition-[d] duration-500 ease-in-out"
        />
        <path
          d={railPath}
          fill="none"
          stroke={theme.accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-[d] duration-500 ease-in-out"
        />
      </svg>

      {/* Keys */}
      {keys.map((key) => {
        const isActive = activeNotes.has(key.midi);
        return (
          <motion.button
            key={key.midi}
            id={`key-${key.midi}`}
            className={`absolute flex items-end justify-center select-none cursor-pointer border-b-4
              ${key.isSharp 
                ? 'w-6 h-20 rounded-b-sm border-black/40 z-20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5)]' 
                : 'w-10 h-32 rounded-sm border-gray-300 shadow-xl z-10'}
            `}
            style={{
              left: key.x,
              top: key.y,
              transform: `translate(-50%, 0%) rotate(${key.angle}deg)`,
              transformOrigin: 'top center',
              backgroundColor: isActive 
                ? '#555555' 
                : (key.isSharp ? '#1a1a1a' : 'white'),
              borderColor: isActive ? theme.accent : undefined,
              boxShadow: isActive ? `0 0 20px ${theme.glow}` : undefined,
              transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s', // Only transition color/effects
            }}
            onMouseDown={() => playNote(key.midi)}
            onMouseUp={() => releaseNote(key.midi)}
            onMouseLeave={() => isActive && releaseNote(key.midi)}
            onMouseEnter={(e) => { 
              if (e.buttons === 1) playNote(key.midi); 
            }}
            onTouchStart={(e) => { e.preventDefault(); playNote(key.midi); }}
            onTouchEnd={(e) => { e.preventDefault(); releaseNote(key.midi); }}
            initial={false}
          >
            {/* No labels purely aesthetic */}
          </motion.button>
        );
      })}

      {/* Subtle background labels */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <span className="text-[15vw] font-black uppercase tracking-[0.2em]">{waveform}</span>
      </div>
    </div>
  );
};
