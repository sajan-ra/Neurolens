
import React, { useState, useRef, useEffect } from 'react';

interface AudioPhaseProps {
  onComplete: (data: any) => void;
}

const PHILOSOPHICAL_PROMPTS = [
  "What is something you would do today if you knew you could not fail, and why haven't you done it yet?",
  "In your opinion, what is the difference between existing and truly living?",
  "If you could have a conversation with your future self, what is the one thing you'd hope they still remember?",
  "What is a small, everyday moment that always brings you peace, and what does that say about you?"
];

export const AudioPhase: React.FC<AudioPhaseProps> = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(180);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Real Tracking States
  const [realPauseCount, setRealPauseCount] = useState(0);
  const isSilentRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentPrompt(PHILOSOPHICAL_PROMPTS[Math.floor(Math.random() * PHILOSOPHICAL_PROMPTS.length)]);
    return () => cleanupAudio();
  }, []);

  const cleanupAudio = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
  };

  const startAnalysis = async () => {
    setMicError(null);
    setRealPauseCount(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        setAudioLevel(average); 

        // DETECT REAL PAUSES
        const SILENCE_THRESHOLD = 15; // Low volume threshold
        if (average < SILENCE_THRESHOLD) {
          if (!isSilentRef.current) {
            isSilentRef.current = true;
            silenceStartRef.current = Date.now();
          } else if (silenceStartRef.current && (Date.now() - silenceStartRef.current > 1500)) {
            // If silent for more than 1.5 seconds, count as a significant pause
            setRealPauseCount(prev => prev + 1);
            silenceStartRef.current = Date.now() + 1000000; // Prevent double counting same silence
          }
        } else {
          isSilentRef.current = false;
          silenceStartRef.current = null;
        }

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setProgress(prev => (prev >= 100 ? 100 : prev + 1));
        setSecondsRemaining(prev => Math.max(0, prev - 1.8));
      }, 1800);

    } catch (err) {
      setMicError("Microphone access denied.");
    }
  };

  const stopAnalysis = () => {
    cleanupAudio();
    setIsRecording(false);
    onComplete({
      transcript: `Response to: ${currentPrompt}`,
      pauseCount: realPauseCount, // ACTUAL CAPTURED DATA
      audioClarity: audioLevel > 10 ? 0.9 : 0.2,
      analysisDuration: 180 - secondsRemaining
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-teal-900/10 p-6 rounded-xl border border-teal-500/20">
        <h3 className="text-teal-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
          <i className="fas fa-comment-dots"></i> Reflective Thought Task
        </h3>
        <p className="text-xl font-semibold text-white italic">"{currentPrompt}"</p>
      </div>

      <div className="flex flex-col items-center justify-center p-12 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden">
        {isRecording && <div className="scanner-line opacity-30"></div>}
        <div className="absolute top-6 right-8 font-mono text-2xl text-teal-400 font-bold">
          {Math.floor(secondsRemaining / 60)}:{(Math.floor(secondsRemaining % 60)).toString().padStart(2, '0')}
        </div>

        <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 ${isRecording ? 'border-red-500' : 'border-teal-500'}`}>
          <i className={`fas ${isRecording ? 'fa-volume-high' : 'fa-microphone'} text-4xl ${isRecording ? 'text-red-500' : 'text-teal-400'}`}></i>
        </div>

        <div className="mt-10 flex flex-col items-center">
          <div className="text-[10px] text-gray-500 mb-2 uppercase font-mono">Detected Pauses: <span className="text-teal-400 font-bold">{realPauseCount}</span></div>
          <button
            onClick={isRecording ? stopAnalysis : startAnalysis}
            className={`px-14 py-4 rounded-2xl font-black text-lg transition-all ${isRecording ? 'bg-red-600 text-white' : 'bg-teal-500 text-black'}`}
          >
            {isRecording ? 'I HAVE FINISHED SPEAKING' : 'START VOCAL ASSESSMENT'}
          </button>
        </div>
      </div>
    </div>
  );
};
