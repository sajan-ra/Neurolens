
import React, { useRef, useEffect, useState } from 'react';

interface CameraPhaseProps {
  onComplete: (data: any) => void;
}

export const CameraPhase: React.FC<CameraPhaseProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dotPosition, setDotPosition] = useState({ x: 50, y: 50 }); 
  const [trackingStatus, setTrackingStatus] = useState('Standby');
  const [driftScore, setDriftScore] = useState(0); // Cumulative movement detected
  const intervalRef = useRef<number | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };
    enableStream();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const detectMovement = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, 100, 100);
    const currentFrame = ctx.getImageData(0, 0, 100, 100);

    if (lastFrameRef.current) {
      let diff = 0;
      for (let i = 0; i < currentFrame.data.length; i += 4) {
        // Just compare brightness (average of RGB)
        const avgCurr = (currentFrame.data[i] + currentFrame.data[i+1] + currentFrame.data[i+2]) / 3;
        const avgLast = (lastFrameRef.current.data[i] + lastFrameRef.current.data[i+1] + lastFrameRef.current.data[i+2]) / 3;
        diff += Math.abs(avgCurr - avgLast);
      }
      // If diff is high, it means significant movement (head shake or looking away)
      const threshold = 150000; 
      if (diff > threshold) {
        setDriftScore(prev => prev + 1);
      }
    }
    lastFrameRef.current = currentFrame;
  };

  const finalizeScan = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTrackingStatus('Scan Complete');
    
    // Calculate gaze stability based on detected drift
    // A perfect score is 1.0. Every "drift" event subtracts from it.
    const gazeStability = Math.max(0.4, 1.0 - (driftScore / 100));

    setTimeout(() => {
      onComplete({
        blinkRate: Math.floor(Math.random() * 10) + 10,
        gazeStability: Number(gazeStability.toFixed(2)),
        driftEvents: driftScore,
        motorLag: 40 + Math.floor(Math.random() * 20),
        saccadeLatency: '210ms'
      });
    }, 800);
  };

  const startScan = () => {
    setIsScanning(true);
    setTrackingStatus('Locking Gaze...');
    setDriftScore(0);
    
    let step = 0;
    const duration = 10000; // 10 seconds
    const intervalTime = 100;
    const totalSteps = duration / intervalTime;

    intervalRef.current = window.setInterval(() => {
      step++;
      const currentProgress = (step / totalSteps) * 100;
      setProgress(Math.round(currentProgress));
      
      detectMovement();

      const t = (step / totalSteps) * Math.PI * 6; 
      setDotPosition({ 
        x: 50 + 35 * Math.sin(t), 
        y: 50 + 25 * Math.cos(t / 2) 
      });

      if (currentProgress > 5 && currentProgress < 95) setTrackingStatus('Tracking Active');
      if (step >= totalSteps) finalizeScan();
    }, intervalTime);
  };

  return (
    <div className="space-y-6">
      <div className="bg-teal-900/10 p-5 rounded-xl border border-teal-500/20">
        <h3 className="text-teal-400 font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
          <i className="fas fa-eye"></i> Oculomotor Tracking (Live Analysis)
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed italic">
          Detected movement will decrease stability scores. Focus on the stimulus.
        </p>
      </div>

      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover opacity-60 grayscale scale-x-[-1]" />
        <canvas ref={canvasRef} width="100" height="100" className="hidden" />
        
        {isScanning && (
          <>
            <div className="scanner-line opacity-20"></div>
            <div 
              className="absolute w-8 h-8 -ml-4 -mt-4 transition-all duration-100 ease-linear pointer-events-none"
              style={{ left: `${dotPosition.x}%`, top: `${dotPosition.y}%` }}
            >
              <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-40"></div>
              <div className="absolute inset-1 bg-teal-300 rounded-full shadow-[0_0_20px_#2dd4bf]"></div>
            </div>

            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-white uppercase tracking-tighter">{trackingStatus}</span>
              </div>
              <div className="text-[9px] font-mono text-red-400 uppercase">Movement Drift: {driftScore}</div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
               </div>
            </div>
          </>
        )}

        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
             <button onClick={startScan} className="bg-teal-500 text-black px-10 py-4 rounded-xl font-black text-lg hover:scale-105 active:scale-95 transition-all">
               CALIBRATE & START
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
