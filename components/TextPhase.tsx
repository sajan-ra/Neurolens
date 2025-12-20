
import React, { useState, useEffect, useRef } from 'react';

interface TextPhaseProps {
  onComplete: (data: any) => void;
}

export const TextPhase: React.FC<TextPhaseProps> = ({ onComplete }) => {
  const [input, setInput] = useState('');
  const [metrics, setMetrics] = useState({ backspaces: 0, startTime: 0 });
  const [isStarted, setIsStarted] = useState(false);
  const targetText = "The quick brown fox jumps over the lazy dog. A clear mind allows for focus and determination in the face of complex challenges.";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isStarted) {
      setIsStarted(true);
      setMetrics(prev => ({ ...prev, startTime: Date.now() }));
    }
    if (e.key === 'Backspace') {
      setMetrics(prev => ({ ...prev, backspaces: prev.backspaces + 1 }));
    }
  };

  const handleSubmit = () => {
    const durationMinutes = (Date.now() - metrics.startTime) / 60000;
    const wpm = (input.length / 5) / durationMinutes;
    
    // Calculate real errors
    const inputWords = input.trim().split(/\s+/);
    const targetWords = targetText.trim().split(/\s+/);
    let errors = 0;
    inputWords.forEach((word, i) => {
      if (word !== targetWords[i]) errors++;
    });

    onComplete({
      content: input,
      backspaces: metrics.backspaces,
      typingSpeed: Math.round(wpm),
      errors: errors,
      accuracy: Math.max(0, 100 - (errors * 5))
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg italic text-gray-400 select-none">
        "{targetText}"
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-32 bg-black border border-teal-500/40 rounded-xl p-4 text-white font-mono"
        placeholder="Start typing the text above..."
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs font-mono text-gray-500">
          <div>Backspaces: <span className="text-teal-400">{metrics.backspaces}</span></div>
          <div>Chars: <span className="text-teal-400">{input.length}</span></div>
        </div>
        <button 
          disabled={input.length < 10}
          onClick={handleSubmit}
          className="bg-teal-600 text-white px-8 py-2 rounded-lg hover:bg-teal-500"
        >
          Submit Entry
        </button>
      </div>
    </div>
  );
};
