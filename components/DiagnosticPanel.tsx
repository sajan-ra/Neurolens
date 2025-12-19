
import React from 'react';

interface DiagnosticPanelProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  onNext: () => void;
  onPrev?: () => void;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ 
  title, icon, children, onNext, onPrev 
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 glass-panel rounded-2xl border border-teal-500/20 shadow-2xl animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
        <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/40">
          <i className={`fas ${icon} text-teal-400 text-xl`}></i>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight uppercase">{title}</h2>
      </div>
      
      <div className="mb-10 text-gray-300">
        {children}
      </div>

      <div className="flex justify-between mt-8">
        {onPrev && (
          <button 
            onClick={onPrev}
            className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
          >
            Previous
          </button>
        )}
        <button 
          onClick={onNext}
          className="ml-auto px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-lg neon-glow transition-all flex items-center gap-2 group"
        >
          Proceed to Next Phase
          <i className="fas fa-chevron-right text-sm group-hover:translate-x-1 transition-transform"></i>
        </button>
      </div>
    </div>
  );
};
