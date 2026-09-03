import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult } from '../types';
import { ShieldCheck, ShieldAlert, RotateCcw } from 'lucide-react';

interface ResultRevealProps {
  result: AnalysisResult;
  onReset: () => void;
}

// Odometer component for the confidence number
function Odometer({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1200; // ms

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(value * ease);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{displayValue.toFixed(1)}</span>;
}

export default function ResultReveal({ result, onReset }: ResultRevealProps) {
  const isHuman = result.verdict === 'human';
  
  const accentColor = isHuman ? 'text-molten-human' : 'text-molten-spoof';
  const bgColor = isHuman ? 'bg-molten-human' : 'bg-molten-spoof';
  const glowShadow = isHuman ? 'shadow-glow-human' : 'shadow-glow-spoof';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl flex flex-col items-center z-10"
    >
      {/* Heavy Vignette flash on reveal */}
      <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed inset-0 bg-black/60 z-0 pointer-events-none"
      />

      {/* Particle Burst (Simple implementation) */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`w-64 h-64 rounded-full ${bgColor} blur-[80px]`}
        />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`premium-card p-12 flex flex-col items-center w-full border ${isHuman ? 'border-molten-human/30' : 'border-molten-spoof/30'} relative z-10 transition-shadow`}
      >
        <div className={`flex items-center gap-3 mb-6 ${accentColor}`}>
          {isHuman ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
          <h2 className="font-sans text-3xl font-bold tracking-tight uppercase">
            {isHuman ? 'Human' : 'Spoof Detected'}
          </h2>
        </div>

        <div className="flex items-baseline gap-2 mb-8">
          <h1 className={`font-mono text-7xl md:text-9xl font-bold ${accentColor} ${glowShadow} rounded-lg p-2 leading-none`}>
            <Odometer value={result.confidence} />
          </h1>
          <span className={`font-mono text-3xl ${accentColor}`}>%</span>
        </div>

        <div className="w-full bg-[#110E0D] p-6 rounded-lg border border-molten-border mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs text-molten-textSecondary uppercase tracking-widest">Confidence Spectrum</span>
            <span className="font-mono text-xs text-molten-textSecondary uppercase tracking-widest">{isHuman ? 'Authentic' : 'Synthetic'}</span>
          </div>
          
          <div className="w-full h-2 bg-molten-base rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence}%` }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              className={`absolute top-0 left-0 h-full ${bgColor}`}
            />
          </div>

          <p className="font-mono text-sm text-molten-textPrimary mt-6 leading-relaxed">
            {isHuman 
              ? "Analysis indicates natural vocal tract resonance and acoustic consistency. No synthetic signatures detected."
              : `High spectral inconsistency detected in multiple segments. Analysis confirms deepfake generation artifacts.`
            }
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className={`flex items-center gap-2 font-mono text-sm uppercase tracking-widest px-8 py-4 rounded bg-molten-surface border border-molten-border hover:border-molten-textPrimary hover:text-white transition-all duration-200`}
        >
          <RotateCcw size={16} /> Analyze Another File
        </motion.button>

      </motion.div>
    </motion.div>
  );
}
