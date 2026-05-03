/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import * as Tone from 'tone';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RailwayKeyboard } from './components/RailwayKeyboard';
import { WaveformType, WAVEFORM_THEMES } from './constants';

export default function App() {
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [activeNote, setActiveNote] = useState<string | undefined>();
  const [isStarted, setIsStarted] = useState(false);

  const startAudio = async () => {
    await Tone.start();
    setIsStarted(true);
  };

  const handleReset = () => {
    setOctaveOffset(0);
    setVolume(0.75);
    setResetTrigger(prev => prev + 1);
  };

  const [resetTrigger, setResetTrigger] = useState(0);
  const theme = WAVEFORM_THEMES[waveform];

  return (
    <div 
      className="relative w-screen h-screen text-white flex flex-col font-sans overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: theme.bgDeep }}
    >
      {!isStarted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <button
            onClick={startAudio}
            className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-110 transition-transform active:scale-95"
            style={{ boxShadow: '0 0 40px rgba(255,255,255,0.2)' }}
            id="btn-start-audio"
          >
            Start Instrument
          </button>
        </div>
      )}

      <Header 
        waveform={waveform} 
        octaveOffset={octaveOffset}
        setOctaveOffset={setOctaveOffset}
        volume={volume}
        setVolume={setVolume}
        onReset={handleReset}
      />
      
      <main className="flex-1 w-full relative flex flex-col bg-[#050505]">
        <RailwayKeyboard 
          waveform={waveform} 
          octaveOffset={octaveOffset} 
          volume={volume} 
          resetTrigger={resetTrigger}
          onActiveNoteChange={setActiveNote}
        />
      </main>

      <Footer 
        waveform={waveform} 
        setWaveform={setWaveform} 
        activeNote={activeNote}
      />

      {/* Atmospheric backgrounds */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(8,8,8,1) 85%)`,
          zIndex: 1
        }}
      />
      
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${theme.muted} 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, ${theme.muted} 0%, transparent 50%)`,
          zIndex: 0
        }}
      />
    </div>
  );
}

