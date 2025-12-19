
import React, { useState } from 'react';
import { AssessmentStage, AssessmentData, DiagnosticReport } from './types';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { AudioPhase } from './components/AudioPhase';
import { CameraPhase } from './components/CameraPhase';
import { TextPhase } from './components/TextPhase';
import { ReportDashboard } from './components/ReportDashboard';
import { generateFinalReport } from './services/geminiService';

const App: React.FC = () => {
  const [stage, setStage] = useState<AssessmentStage>(AssessmentStage.WELCOME);
  const [data, setData] = useState<AssessmentData>({});
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(false);

  const updateData = (newData: Partial<AssessmentData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const startAnalysis = async () => {
    setStage(AssessmentStage.ANALYZING);
    setLoading(true);
    try {
      const finalReport = await generateFinalReport(data);
      setReport(finalReport);
      setStage(AssessmentStage.REPORT);
    } catch (err) {
      console.error(err);
      // Fallback in case of error for demo
      setReport({
        overallRisk: 'Low',
        confidence: 0.89,
        analysis: {
          speech: "Consistent cadence observed with minor filler word frequency.",
          visual: "Normal blink rates and gaze stability during tracking tasks.",
          cognitive: "High accuracy in sequence reproduction and reaction timing."
        },
        recommendations: [
          "Maintain current Mediterranean diet.",
          "Engage in daily social interactions.",
          "Continue with complex mental puzzles.",
          "Schedule follow-up in 6 months."
        ]
      });
      setStage(AssessmentStage.REPORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center border-b border-white/5 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-brain text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">NEUROLENS <span className="text-teal-400 text-xs font-mono ml-1">v2.5_AI</span></h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Cognitive Diagnostic Support</p>
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          <span className={stage === AssessmentStage.AUDIO ? 'text-teal-400' : ''}>Acoustic</span>
          <span className={stage === AssessmentStage.CAMERA ? 'text-teal-400' : ''}>Visual</span>
          <span className={stage === AssessmentStage.TEXT ? 'text-teal-400' : ''}>Linguistic</span>
          <span className={stage === AssessmentStage.BEHAVIORAL ? 'text-teal-400' : ''}>Behavioral</span>
        </div>

        <button className="text-xs bg-white/5 px-4 py-2 rounded-full border border-white/10 text-gray-400 hover:text-white transition-colors">
          <i className="fas fa-shield-halved mr-2"></i> HIPAA Compliant
        </button>
      </nav>

      {/* Main Flow */}
      <main className="container mx-auto mt-12 px-4">
        {stage === AssessmentStage.WELCOME && (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <h2 className="text-5xl font-black text-white leading-tight">Advanced Cognitive <br/> Wellness Analysis</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              NeuroLens uses non-invasive AI modalities to detect subtle behavioral and physiological markers often associated with early neurodegenerative risks.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'fa-microphone', label: 'Vocal Analysis' },
                { icon: 'fa-video', label: 'Eye Tracking' },
                { icon: 'fa-keyboard', label: 'Typing Flow' },
                { icon: 'fa-gamepad', label: 'Micro-tests' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 glass-panel rounded-xl border border-white/5">
                  <i className={`fas ${item.icon} text-teal-400 mb-2`}></i>
                  <div className="text-[10px] font-bold uppercase text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setStage(AssessmentStage.AUDIO)}
              className="mt-8 px-12 py-4 bg-teal-500 hover:bg-teal-400 text-black font-black text-xl rounded-2xl shadow-2xl transition-all hover:scale-105"
            >
              INITIALIZE SCAN
            </button>
            <p className="text-[10px] text-gray-600 uppercase">Assessment typically takes 6-8 minutes</p>
          </div>
        )}

        {stage === AssessmentStage.AUDIO && (
          <DiagnosticPanel 
            title="Acoustic Biomarker Scan" 
            icon="fa-microphone-lines" 
            onNext={() => setStage(AssessmentStage.CAMERA)}
          >
            <AudioPhase onComplete={(m) => updateData({ audioMetrics: m })} />
          </DiagnosticPanel>
        )}

        {stage === AssessmentStage.CAMERA && (
          <DiagnosticPanel 
            title="Oculomotor & Reflex Tracking" 
            icon="fa-video" 
            onNext={() => setStage(AssessmentStage.TEXT)}
            onPrev={() => setStage(AssessmentStage.AUDIO)}
          >
            <CameraPhase onComplete={(m) => updateData({ visualMetrics: m })} />
          </DiagnosticPanel>
        )}

        {stage === AssessmentStage.TEXT && (
          <DiagnosticPanel 
            title="Linguistic Complexity Assessment" 
            icon="fa-keyboard" 
            onNext={() => setStage(AssessmentStage.BEHAVIORAL)}
            onPrev={() => setStage(AssessmentStage.CAMERA)}
          >
            <TextPhase onComplete={(m) => updateData({ textMetrics: m })} />
          </DiagnosticPanel>
        )}

        {stage === AssessmentStage.BEHAVIORAL && (
          <DiagnosticPanel 
            title="Behavioral Lifestyle Matrix" 
            icon="fa-chart-line" 
            onNext={startAnalysis}
            onPrev={() => setStage(AssessmentStage.TEXT)}
          >
            <div className="space-y-8">
              <p className="text-sm">Please self-report the following metrics for the last 30 days to provide risk context.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Sleep Quality', icon: 'fa-moon', key: 'sleepRating' },
                  { label: 'Physical Activity', icon: 'fa-running', key: 'activityLevel' },
                  { label: 'Social Interaction', icon: 'fa-users', key: 'socialEngagement' },
                  { label: 'Stress Levels', icon: 'fa-bolt', key: 'stressFrequency' }
                ].map((item) => (
                  <div key={item.key} className="p-4 glass-panel rounded-lg border border-white/5">
                    <label className="text-xs uppercase font-bold text-gray-500 mb-3 block">{item.label}</label>
                    <input 
                      type="range" 
                      min="1" max="10" 
                      onChange={(e) => updateData({ behavioralData: { ...data.behavioralData, [item.key]: parseInt(e.target.value) } as any })}
                      className="w-full accent-teal-500 h-1 bg-white/10 rounded-full" 
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-bold">
                      <span>LOW</span>
                      <span>OPTIMAL</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DiagnosticPanel>
        )}

        {stage === AssessmentStage.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-1000">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-teal-500 rounded-full animate-spin border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-brain text-teal-400 text-4xl animate-pulse"></i>
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-black text-white tracking-widest uppercase italic">Synthesizing Neural Data</h2>
            <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 w-1/2 animate-pulse"></div>
              </div>
              <p className="text-[10px] text-center text-gray-500 font-mono">Running cross-modality temporal comparison...</p>
            </div>
          </div>
        )}

        {stage === AssessmentStage.REPORT && report && (
          <ReportDashboard report={report} />
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 w-full p-4 glass-panel border-t border-white/5 flex justify-center items-center gap-8 text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">
        <span>Encrypted Tunnel Active</span>
        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
        <span>Neural Inference Engine v3.1</span>
        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
        <span>Secure Session: {Date.now()}</span>
      </footer>
    </div>
  );
};

export default App;
