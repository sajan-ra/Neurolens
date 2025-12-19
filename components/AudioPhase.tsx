
import React, { useState, useRef, useEffect } from 'react';

interface AudioPhaseProps {
  onComplete: (data: any) => void;
}

const PHILOSOPHICAL_PROMPTS = [
  "If the universe is entirely physical, can there be such a thing as free will, or is every choice pre-determined by the laws of physics?",
  "Does language shape our thoughts, or does thought exist independently of the words we use to describe it?",
  "If you were to replace every single cell in your body over the next seven years, would you still be the same person at the end of that journey?",
  "What is the nature of consciousness? Is it a byproduct of biological complexity, or something more fundamental to the fabric of reality?",
  "In a world where digital copies of a mind could exist, what would define the 'original' self?"
];

export const AudioPhase: React.FC<AudioPhaseProps> = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(180);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentPrompt(PHILOSOPHICAL_PROMPTS[Math.floor(Math.random() * PHILOSOPHICAL_PROMPTS.length)]);
  }, []);

  const startAnalysis = () => {
    setIsRecording(true);
    setProgress(0);
    setSecondsRemaining(180);
    
    // 3 minutes = 180,000ms. 
    // We update 100 times to fill the bar. 180,000 / 100 = 1,800ms per 1% increment.
    timerRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          stopAnalysis();
          return 100;
        }
        return prev + 1;
      });
      setSecondsRemaining(prev => Math.max(0, prev - 1.8)); // Approximate countdown
    }, 1800); 
  };

  const stopAnalysis = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    // Mock metrics based on the deep linguistic analysis requested
    onComplete({
      transcript: `Extended philosophical discourse regarding: ${currentPrompt}`,
      pauseCount: 12,
      fillerWords: ["um", "uh", "actually", "like"],
      speechRate: 135,
      lexicalDiversity: 0.82,
      analysisDuration: 180
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-teal-900/10 p-5 rounded-lg border border-teal-500/20">
        <h3 className="text-teal-400 font-bold mb-3 flex items-center gap-2">
          <i className="fas fa-brain text-xs"></i>
          Deep Linguistic & Cognitive Prompt
        </h3>
        <p className="text-lg font-medium text-white italic leading-relaxed">
          "{currentPrompt}"
        </p>
        <p className="text-xs text-gray-500 mt-4 uppercase tracking-tighter">
          Goal: Speak continuously for 3 minutes to allow the AI to map complex syntax and temporal speech markers.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-10 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden">
        {isRecording && <div className="scanner-line opacity-50"></div>}
        
        <div className="absolute top-4 right-6 font-mono text-xl text-teal-400">
          {formatTime(secondsRemaining)}
        </div>

        <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isRecording ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] scale-110' : 'border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.2)]'}`}>
          <i className={`fas ${isRecording ? 'fa-waveform' : 'fa-microphone-lines'} text-4xl ${isRecording ? 'text-red-500 animate-pulse' : 'text-teal-400'}`}></i>
        </div>

        <div className="mt-10 w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10">
          <div 
            className="bg-gradient-to-r from-teal-600 to-teal-400 h-full transition-all duration-[1800ms] ease-linear" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="mt-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          {isRecording ? 'Analyzing Temporal Cadence...' : 'Ready for Acoustic Fingerprinting'}
        </div>

        <button
          onClick={isRecording ? stopAnalysis : startAnalysis}
          className={`mt-8 px-12 py-4 rounded-xl font-black transition-all transform hover:scale-105 ${isRecording ? 'bg-red-600 text-white' : 'bg-teal-500 text-black'}`}
        >
          {isRecording ? 'FINISH EARLY' : 'BEGIN 3-MINUTE ASSESSMENT'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 glass-panel rounded-xl text-center border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Latency</div>
          <div className="font-mono text-teal-400 text-sm">12ms</div>
        </div>
        <div className="p-4 glass-panel rounded-xl text-center border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Bitrate</div>
          <div className="font-mono text-teal-400 text-sm">128kbps</div>
        </div>
        <div className="p-4 glass-panel rounded-xl text-center border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Symmetry</div>
          <div className="font-mono text-teal-400 text-sm">Balanced</div>
        </div>
      </div>
    </div>
  );
};
