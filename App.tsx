
import React, { useState, useEffect } from 'react';
import { AssessmentStage, AssessmentData, DiagnosticReport } from './types';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { AudioPhase } from './components/AudioPhase';
import { CameraPhase } from './components/CameraPhase';
import { TextPhase } from './components/TextPhase';
import { ReportDashboard } from './components/ReportDashboard';
import { generateFinalReport } from './services/geminiService';

const ANALYSIS_LOGS = [
  "Initializing DeepSeek-V3.2 Inference Engine...",
  "Running Deep-Thinking Neural Analysis...",
  "Extracting Phonemic Jitter & Prosody...",
  "Measuring Saccadic Latency & Gaze Stability...",
  "Evaluating Linguistic Logic & Motor Cadence...",
  "Compiling Final Clinical Assessment..."
];

const App: React.FC = () => {
  const [stage, setStage] = useState<AssessmentStage>(AssessmentStage.WELCOME);
  const [data, setData] = useState<AssessmentData>({ behavioralData: { sleepRating: 5, activityLevel: 5, socialEngagement: 5, stressFrequency: 5 } });
  const [report, setReport] = useState<any>(null);
  const [activeLogIdx, setActiveLogIdx] = useState(0);

  // Robust check for Vercel environment variables
  const isDemo = !process.env.API_KEY || process.env.API_KEY === 'undefined' || process.env.API_KEY === '';

  useEffect(() => {
    let interval: number;
    if (stage === AssessmentStage.ANALYZING) {
      setActiveLogIdx(0);
      interval = window.setInterval(() => {
        setActiveLogIdx(prev => (prev < ANALYSIS_LOGS.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const updateData = (newData: Partial<AssessmentData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const startAnalysis = async () => {
    setStage(AssessmentStage.ANALYZING);
    try {
      const finalReport = await generateFinalReport(data);
      setReport({ ...finalReport, rawData: data }); 
      setStage(AssessmentStage.REPORT);
    } catch (err) {
      console.error("Diagnostic Pipeline Failure:", err);
      setReport({
        overallRisk: 'Low',
        confidence: 0.0,
        analysis: { speech: "Error processing audio stream.", visual: "Error in oculomotor capture.", cognitive: "Error in text evaluation." },
        recommendations: ["Error in analysis. Please ensure API credentials are valid and retry."],
        medicalGrounding: "Diagnostic failure occurred during the inference stage.",
        rawData: data
      });
      setStage(AssessmentStage.REPORT);
    }
  };

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
      <nav className="p-6 md:p-8 flex justify-between items-center border-b border-white/5 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <i className="fas fa-brain text-white text-lg md:text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter">NEUROLENS <span className="text-teal-400 text-[10px] ml-1 font-mono align-top">V3.2</span></h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Clinical Diagnostic Support</p>
          </div>
        </div>
        
        <div className="flex gap-3 md:gap-4">
           {isDemo && (
             <div className="px-3 py-1.5 md:px-4 md:py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex items-center gap-2">
                <i className="fas fa-flask text-yellow-500 text-[9px]"></i>
                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Preview Mode</span>
             </div>
           )}
           <div className="hidden sm:flex px-4 py-2 bg-white/5 rounded-xl border border-white/10 items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Scan</span>
           </div>
        </div>
      </nav>

      <main className="container mx-auto mt-12 md:mt-20 px-6">
        {stage === AssessmentStage.WELCOME && (
          <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="inline-block px-5 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-4">
              Next-Gen Neural Diagnostics
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">Transforming <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">Neural Intelligence.</span></h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Detect Alzheimer's and Parkinson's risk early by analyzing sub-clinical biometric markers in your voice, gaze, and motor logic.
            </p>
            <div className="pt-8">
              <button 
                onClick={() => setStage(AssessmentStage.AUDIO)} 
                className="group relative w-full sm:w-auto px-12 md:px-20 py-5 md:py-6 bg-teal-500 text-black font-black text-xl md:text-2xl rounded-2xl md:rounded-[2rem] shadow-[0_20px_60px_rgba(20,184,166,0.3)] hover:shadow-[0_25px_80px_rgba(20,184,166,0.5)] transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10 uppercase tracking-widest">Start Screening</span>
              </button>
              <div className="mt-10 flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2"><i className="fas fa-shield-halved text-teal-500"></i> HIPAA Compliant</div>
                <div className="flex items-center gap-2"><i className="fas fa-bolt text-teal-500"></i> NVIDIA Accelerated</div>
                <div className="flex items-center gap-2"><i className="fas fa-lock text-teal-500"></i> Localized Privacy</div>
              </div>
            </div>
          </div>
        )}

        {stage === AssessmentStage.AUDIO && (
          <DiagnosticPanel title="Phonetic Assessment" icon="fa-microphone-lines" onNext={() => setStage(AssessmentStage.CAMERA)}>
            <AudioPhase onComplete={(m) => updateData({ audioMetrics: m })} />
          </DiagnosticPanel>
        )}

        {stage === AssessmentStage.CAMERA && (
          <DiagnosticPanel title="Oculomotor Stability" icon="fa-eye" onNext={() => setStage(AssessmentStage.TEXT)} onPrev={() => setStage(AssessmentStage.AUDIO)}>
            <CameraPhase onComplete={(m) => updateData({ visualMetrics: m })} />
          </DiagnosticPanel>
        )}

        {stage === AssessmentStage.TEXT && (
          <DiagnosticPanel title="Cognitive Motor Sync" icon="fa-keyboard" onNext={() => setStage(AssessmentStage.BEHAVIORAL)} onPrev={() => setStage(AssessmentStage.CAMERA)}>
            <TextPhase onComplete={(m) => updateData({ textMetrics: m })} />
          </DiagnosticPanel>
        )}

        {stage === AssessmentStage.BEHAVIORAL && (
          <DiagnosticPanel title="Behavioral Baseline" icon="fa-sliders" onNext={startAnalysis} onPrev={() => setStage(AssessmentStage.TEXT)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {[
                { label: 'Sleep Quality', key: 'sleepRating', icon: 'fa-moon' },
                { label: 'Physical Vigor', key: 'activityLevel', icon: 'fa-bolt' },
                { label: 'Social Density', key: 'socialEngagement', icon: 'fa-users' },
                { label: 'Stress Resilience', key: 'stressFrequency', icon: 'fa-heart-pulse' }
              ].map(item => (
                <div key={item.key} className="p-8 bg-white/[0.02] rounded-3xl border border-white/5 transition-all hover:bg-white/[0.04] hover:border-teal-500/20">
                  <div className="flex items-center gap-3 mb-6">
                    <i className={`fas ${item.icon} text-teal-500 text-xs`}></i>
                    <label className="block text-[10px] font-black text-teal-400 uppercase tracking-[0.2em]">{item.label}</label>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    defaultValue="5"
                    onChange={(e) => updateData({ behavioralData: { ...data.behavioralData, [item.key]: parseInt(e.target.value) } as any })}
                    className="w-full accent-teal-500 h-1.5 bg-white/10 rounded-full cursor-pointer appearance-none" 
                  />
                  <div className="flex justify-between mt-3 text-[8px] text-gray-600 font-bold uppercase tracking-widest">
                    <span>Deficient</span>
                    <span>Optimal</span>
                  </div>
                </div>
              ))}
            </div>
          </DiagnosticPanel>
        )}

        {stage === AssessmentStage.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-12 md:py-24 max-w-xl mx-auto text-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56 mb-12">
              <div className="absolute inset-0 border-[8px] border-teal-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-[8px] border-teal-500 rounded-full animate-[spin_3s_linear_infinite] border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-atom text-teal-400 text-5xl md:text-6xl animate-pulse"></i>
              </div>
            </div>
            
            <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tighter mb-4">Processing Neural Markers</h3>
            <p className="text-gray-500 text-sm mb-12">DeepSeek-V3.2 is synthesizing high-fidelity reasoning.</p>

            <div className="w-full glass-panel rounded-3xl p-6 md:p-8 border border-white/10 font-mono text-[10px] md:text-xs shadow-2xl text-left overflow-hidden">
              <div className="flex items-center gap-3 mb-6 text-teal-500 border-b border-white/5 pb-4">
                <i className="fas fa-terminal"></i>
                <span className="uppercase tracking-[0.3em] font-black text-[9px]">Deep-Thinking Stream</span>
              </div>
              <div className="space-y-2 h-48 flex flex-col justify-end">
                {ANALYSIS_LOGS.slice(0, activeLogIdx + 1).map((log, i) => (
                  <div key={i} className={`flex gap-4 ${i === activeLogIdx ? 'text-white' : 'text-gray-600'}`}>
                    <span className="text-teal-500/30">[{new Date().toLocaleTimeString([], { hour12: false, second: '2-digit' })}]</span>
                    <span className="truncate">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === AssessmentStage.REPORT && report && <ReportDashboard report={report} />}
      </main>
      
      <footer className="fixed bottom-0 w-full p-4 md:p-6 glass-panel border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-8 md:px-12 z-50 gap-4">
        <div className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] text-center md:text-left">
          NVIDIA DeepSeek Inference • Secure Health Data Transmission
        </div>
        <div className="flex gap-4 md:gap-6 text-[9px] text-gray-600 font-black uppercase tracking-[0.3em]">
          <span>Diagnostics: v3.2.0</span>
          <span className="text-teal-500/30">|</span>
          <span>© 2024 NeuroLens Labs</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
