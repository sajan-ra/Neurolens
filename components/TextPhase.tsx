
import React, { useState, useEffect, useRef } from 'react';

interface TextPhaseProps {
  onComplete: (data: any) => void;
}

export const TextPhase: React.FC<TextPhaseProps> = ({ onComplete }) => {
  const [input, setInput] = useState('');
  const [metrics, setMetrics] = useState({ backspaces: 0, startTime: 0, charCount: 0 });
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
    const duration = (Date.now() - metrics.startTime) / 1000;
    const wpm = (input.length / 5) / (duration / 60);
    onComplete({
      content: input,
      backspaces: metrics.backspaces,
      typingSpeed: Math.round(wpm),
      errors: 2,
      complexity: 0.85
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-teal-900/10 p-4 rounded-lg border border-teal-500/20">
        <h3 className="text-teal-400 font-semibold mb-2">Instructions</h3>
        <p className="text-sm">Type the paragraph displayed below. We are monitoring your keystroke cadence, pause durations between words, and correction frequency.</p>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-lg italic text-gray-400 select-none">
        "{targetText}"
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-32 bg-black border border-teal-500/40 rounded-xl p-4 text-white focus:ring-2 focus:ring-teal-500/40 outline-none font-mono"
        placeholder="Start typing here..."
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="text-xs font-mono text-gray-500">
            Backspaces: <span className="text-teal-400">{metrics.backspaces}</span>
          </div>
          <div className="text-xs font-mono text-gray-500">
            Progress: <span className="text-teal-400">{Math.round((input.length / targetText.length) * 100)}%</span>
          </div>
        </div>
        <button 
          disabled={input.length < 20}
          onClick={handleSubmit}
          className="bg-teal-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg hover:bg-teal-500 transition-colors"
        >
          Submit Entry
        </button>
      </div>
    </div>
  );
};
