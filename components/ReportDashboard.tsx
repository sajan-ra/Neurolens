
import React from 'react';
import { DiagnosticReport } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ReportDashboardProps {
  report: DiagnosticReport;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ report }) => {
  const chartData = [
    { subject: 'Speech', A: 85, fullMark: 100 },
    { subject: 'Motor', A: 70, fullMark: 100 },
    { subject: 'Memory', A: 90, fullMark: 100 },
    { subject: 'Focus', A: 65, fullMark: 100 },
    { subject: 'Logic', A: 80, fullMark: 100 },
  ];

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Low': return 'text-green-400 border-green-500/40 bg-green-500/10';
      case 'Moderate': return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
      case 'Elevated': return 'text-red-400 border-red-500/40 bg-red-500/10';
      default: return 'text-white';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000">
      <div className="glass-panel p-8 rounded-3xl border-t-4 border-t-teal-500 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">NEUROLENS WELLNESS REPORT</h1>
            <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest font-mono">Generated ID: NL-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            
            <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-2xl border ${getRiskColor(report.overallRisk)} mb-8`}>
              <div className="text-sm font-semibold uppercase tracking-wider">Overall Risk Profile:</div>
              <div className="text-2xl font-black">{report.overallRisk}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-teal-400 font-bold border-b border-teal-500/20 pb-2">CLINICAL OBSERVATIONS</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Vocal Patterns</div>
                    <p className="text-sm text-gray-300 leading-relaxed">{report.analysis.speech}</p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Visual/Attention Markers</div>
                    <p className="text-sm text-gray-300 leading-relaxed">{report.analysis.visual}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-teal-400 font-bold border-b border-teal-500/20 pb-2">NEXT STEPS</h3>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <i className="fas fa-check-circle text-teal-500 mt-1"></i>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 h-80 glass-panel rounded-2xl p-4 flex flex-col items-center">
             <div className="text-xs text-gray-500 uppercase font-bold mb-4">Cognitive Fingerprint</div>
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 10 }} />
                  <Radar
                    name="NeuroMetrics"
                    dataKey="A"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
             </ResponsiveContainer>
             <div className="mt-4 text-center">
               <div className="text-xl font-bold text-white">{(report.confidence * 100).toFixed(0)}%</div>
               <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Diagnostic Confidence</div>
             </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-xl">
        <div className="flex gap-4 items-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          <p className="text-xs text-red-200 leading-tight">
            <strong>DISCLAIMER:</strong> This NeuroLens report is for educational and screening purposes only. It is not a medical diagnosis. Cognitive patterns can be influenced by stress, fatigue, or other temporary conditions. If you have concerns, please consult a neurologist.
          </p>
        </div>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="w-full py-4 glass-panel hover:bg-white/5 transition-all text-white font-bold rounded-xl border-dashed border-2 border-white/10"
      >
        Restart Full Assessment
      </button>
    </div>
  );
};
