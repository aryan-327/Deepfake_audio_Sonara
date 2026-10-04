import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisViewProps {
  file: File;
  logs: string[];
}

export default function AnalysisView({ file, logs }: AnalysisViewProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Init WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#FF6B35',
        progressColor: '#FFC857',
        cursorColor: '#F5F1EC',
        barWidth: 3,
        barGap: 3,
        barRadius: 3,
        height: 100,
        normalize: true,
      });

      const url = URL.createObjectURL(file);
      wavesurfer.current.load(url);

      // We won't auto-play right away, just show it
      wavesurfer.current.on('ready', () => {
        // wavesurfer.current?.play();
      });

      return () => {
        wavesurfer.current?.destroy();
        wavesurfer.current = null;
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl flex flex-col gap-8 z-10 pt-32 pb-24 px-4"
    >
      {/* Waveform Player Section */}
      <motion.div 
        whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
        className="premium-card p-8 transition-shadow"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-sans font-semibold text-lg text-molten-textPrimary">Acoustic Signature</h3>
            <p className="font-mono text-xs text-molten-textSecondary mt-1">{file.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-molten-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-molten-accent"></span>
            </span>
            <span className="font-mono text-xs text-molten-accent uppercase tracking-widest">Processing</span>
          </div>
        </div>
        
        <div className="relative">
          {/* Glow backdrop */}
          <div className="absolute inset-0 bg-molten-accent/10 blur-xl rounded-full" />
          <div 
            ref={waveformRef} 
            className="w-full relative z-10 animate-pulse-slow"
          />
        </div>
      </motion.div>

      {/* Log Terminal & Gauge Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Terminal */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
          className="md:col-span-2 premium-card p-6 h-64 flex flex-col bg-[#110E0D] transition-shadow"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-molten-textSecondary mb-4 pb-2 border-b border-molten-border flex justify-between">
            <span>Terminal Output</span>
            <span>WS://STREAM</span>
          </div>
          <div 
            ref={terminalRef}
            className="flex-1 overflow-y-auto font-mono text-sm space-y-2 pr-2 custom-scrollbar"
          >
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-molten-accent brightness-125"
                >
                  <span className="opacity-50 mr-2">{log.split('] ')[0] + ']'}</span>
                  <span>{log.split('] ')[1]}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="animate-pulse text-molten-accent">_</div>
          </div>
        </motion.div>

        {/* Confidence Gauge Component (Loading state) */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
          className="premium-card p-6 h-64 flex flex-col items-center justify-center relative transition-shadow"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 p-4 transform -rotate-90">
            {/* Background Arc */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#2A2422" 
              strokeWidth="4" 
              strokeDasharray="188 251" 
              strokeLinecap="round" 
            />
            {/* Animated foreground arc */}
            <motion.circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#FF6B35" 
              strokeWidth="4"
              strokeDasharray="188 251"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 188 }}
              animate={{ strokeDashoffset: [188, 140, 94, 188] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          </svg>
          <div className="font-mono text-[10px] text-molten-textSecondary uppercase tracking-widest absolute bottom-8">
            Analyzing
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
