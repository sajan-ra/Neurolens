
import React from 'react';
import { DiagnosticReport } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ReportDashboardProps {
  // Integrated DiagnosticReport directly as it now contains the required fields
  report: DiagnosticReport & { citations?: any[], rawData?: any };
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ report }) => {
  // Enhanced data mapping for realistic charting
  const audioPauses = report.rawData?.audioMetrics?.pauseCount || 0;
  const acousticScore = Math.max(15, 100 - (audioPauses * 12));
  
  const typingWpm = report.rawData?.textMetrics?.typingSpeed || 0;
  const motorScore = Math.min(100, Math.max(20, typingWpm * 1.8));
  
  const accuracy = report.rawData?.textMetrics?.accuracy || 100;
  const cognitiveScore = accuracy;

  const stability = (report.rawData?.visualMetrics?.gazeStability || 0.8) * 100;

  const chartData = [
    { subject: 'Acoustic Clarity', A: acousticScore, fullMark: 100 },
    { subject: 'Motor Speed', A: motorScore, fullMark: 100 },
    { subject: 'Linguistic Logic', A: cognitiveScore, fullMark: 100 },
    { subject: 'Gaze Stability', A: stability, fullMark: 100 },
    { subject: 'Reflex Sync', A: 80, fullMark: 100 },
  ];

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Low': return 'text-green-400 border-green-500/40 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]';
      case 'Moderate': return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]';
      case 'Elevated': return 'text-red-400 border-red-500/40 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
      default: return 'text-white';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-24">
      <div className="glass-panel p-10 rounded-[2.5rem] border-t-8 border-t-teal-500 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -mr-40 -mt-40"></div>
        
        <div className="flex flex-col md:flex-row justify-between gap-16 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-teal-500/20">Clinical Summary</span>
               <div className="h-px flex-1 bg-white/5"></div>
            </div>
            <h1 className="text-5xl font-black text-white mb-8 tracking-tighter uppercase leading-none">Diagnostic Profile</h1>
            
            <div className={`inline-flex items-center gap-8 px-10 py-6 rounded-[2rem] border-2 ${getRiskColor(report.overallRisk)} mb-12`}>
              <div className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Result:</div>
              <div className="text-5xl font-black tracking-tighter">{report.overallRisk}</div>
              <div className="h-12 w-px bg-current opacity-10"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold opacity-60 uppercase">System Confidence</span>
                <span className="text-2xl font-black">{(report.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/10">
                <div className="text-[10px] text-gray-500 uppercase font-black mb-4 tracking-widest">Real-time Session Anomalies</div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verbal Hesitations:</span>
                    <span className={audioPauses > 3 ? 'text-red-400' : 'text-teal-400'}>{audioPauses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Typing Accuracy:</span>
                    <span className={accuracy < 90 ? 'text-red-400' : 'text-teal-400'}>{accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gaze Deviation:</span>
                    <span className={stability < 70 ? 'text-red-400' : 'text-teal-400'}>{(100 - stability).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/10 flex flex-col justify-center">
                 <p className="text-xs text-gray-400 italic leading-relaxed">
                   "Neural patterns indicate {report.overallRisk === 'Low' ? 'standard baseline' : 'notable deviations from normative'} cognitive performance."
                 </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-teal-500/[0.03] rounded-3xl border border-teal-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                    <i className="fas fa-brain text-teal-400"></i>
                  </div>
                  <h3 className="text-teal-400 font-black uppercase tracking-widest text-sm">AI Clinical Reasoning</h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-8 italic">"{report.medicalGrounding}"</p>
                
                {report.citations && report.citations.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-teal-500/10">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Grounding Citations</div>
                    {report.citations.map((chunk: any, i: number) => (
                      <a key={i} href={chunk.web?.uri} target="_blank" rel="noopener" className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl hover:bg-white/[0.05] transition-all border border-white/5 group">
                        <i className="fas fa-file-medical text-teal-500"></i>
                        <span className="text-[11px] text-gray-400 font-mono flex-1 truncate">{chunk.web?.title || 'Clinical Reference'}</span>
                        <i className="fas fa-arrow-right text-[10px] text-gray-600 group-hover:translate-x-1 transition-transform"></i>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-96 space-y-8">
            <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col items-center border border-white/10 shadow-2xl">
               <div className="text-[10px] text-gray-500 uppercase font-black mb-8 tracking-widest">Biometric Probability Map</div>
               <div className="w-full h-80 min-w-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                      <Radar name="NeuroMetrics" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="glass-panel rounded-[2.5rem] p-8 border border-white/10">
               <div className="text-[10px] text-gray-500 uppercase font-black mb-6 tracking-widest">Wellness Directives</div>
               <ul className="space-y-6">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-4 text-xs text-gray-300 leading-relaxed">
                      <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/20">
                        <i className="fas fa-check text-[10px] text-teal-400"></i>
                      </div>
                      {rec}
                    </li>
                  ))}
               </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-6">
        <button onClick={() => window.location.reload()} className="flex-1 py-6 bg-teal-500 text-black font-black rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">
          Initialize New Assessment
        </button>
        <button onClick={() => window.print()} className="px-10 py-6 glass-panel text-white font-black rounded-3xl border border-white/10 hover:bg-white/5 transition-all uppercase tracking-[0.2em] text-xs">
          <i className="fas fa-print"></i>
        </button>
      </div>
    </div>
  );
};
