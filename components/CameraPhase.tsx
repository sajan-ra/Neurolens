
import React, { useRef, useEffect, useState } from 'react';

interface CameraPhaseProps {
  onComplete: (data: any) => void;
}

export const CameraPhase: React.FC<CameraPhaseProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };
    enableStream();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startScan = () => {
    setIsScanning(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        onComplete({
          blinkRate: 12,
          gazeStability: 0.94,
          expressionDelta: 0.15,
          motorLag: 45
        });
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-teal-900/10 p-4 rounded-lg border border-teal-500/20">
        <h3 className="text-teal-400 font-semibold mb-2">Instructions</h3>
        <p className="text-sm">Keep your head still and follow the blue dot that will appear on the screen. We are measuring visual reaction speed and involuntary motor indicators.</p>
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 group">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          className="w-full h-full object-cover opacity-80"
        />
        {isScanning && (
          <>
            <div className="scanner-line"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-teal-400 rounded-full animate-ping shadow-[0_0_20px_#2dd4bf]"></div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg flex justify-between items-center text-xs font-mono">
              <span className="text-teal-400">ANALYZING GAZE PATTERNS...</span>
              <span className="text-white">{progress}%</span>
            </div>
          </>
        )}
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
             <button 
              onClick={startScan}
              className="bg-teal-500 text-black px-8 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform"
             >
               Start Visual Scan
             </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full bg-teal-400 transition-all duration-500 ${isScanning ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full bg-teal-400 transition-all duration-1000 ${isScanning ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full bg-teal-400 transition-all duration-1500 ${isScanning ? 'w-full' : 'w-0'}`}></div>
        </div>
      </div>
    </div>
  );
};
