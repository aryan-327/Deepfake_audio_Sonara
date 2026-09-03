import React, { useCallback, useState } from 'react';
import { UploadCloud, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import InteractiveWaveform from './InteractiveWaveform';

interface LandingUploadProps {
  onUpload: (file: File) => void;
}

export default function LandingUpload({ onUpload }: LandingUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll logic for parallax
  const { scrollYProgress } = useScroll();
  
  // Foreground moves at 1x implicitly, background elements move at 0.3x
  const yParallaxBackground = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setError(null);
      if (!file.name.toLowerCase().endsWith('.wav')) {
        setError('Invalid format. Please upload a .wav file.');
        return;
      }
      onUpload(file);
    }
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setError(null);
      if (!file.name.toLowerCase().endsWith('.wav')) {
        setError('Invalid format. Please upload a .wav file.');
        return;
      }
      onUpload(file);
    }
  };

  // Reusable animation variants for scroll reveals
  const sectionVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any, staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="w-full relative flex flex-col items-center">
      
      {/* Background Parallax Element */}
      <motion.div 
        style={{ y: yParallaxBackground }}
        className="absolute top-[20%] left-0 right-0 pointer-events-none z-0 flex justify-center opacity-30"
      >
        <div className="w-full max-w-4xl opacity-50">
           {/* We can place additional background decor here if needed */}
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.section 
        className="min-h-screen w-full flex flex-col items-center justify-center pt-20 pb-10 z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-12 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-molten-textPrimary">
            Detect the synthetic.<br/>
            <span className="text-molten-accent">Verify the real.</span>
          </h1>
          <p className="text-molten-textSecondary text-lg font-mono tracking-wide">
            Acoustic anomaly detection and deepfake analysis
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full max-w-3xl mb-12">
          <InteractiveWaveform />
        </motion.div>

        {/* Upload Zone */}
        <motion.div 
          variants={itemVariants}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`premium-card w-full max-w-2xl p-12 flex flex-col items-center justify-center transition-all duration-300 relative ${
            isDragging ? 'border-molten-accent shadow-glow-accent scale-[1.02]' : 'border-molten-border hover:border-molten-accent/50 hover:-translate-y-1'
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 border-[3px] border-molten-accent rounded-xl animate-sonar-ping pointer-events-none" />
          )}

          <input 
            type="file" 
            accept=".wav" 
            onChange={handleChange}
            className="hidden" 
            id="audio-upload"
          />
          <label 
            htmlFor="audio-upload" 
            className="flex flex-col items-center cursor-pointer w-full relative z-10"
          >
            <div className={`p-4 rounded-full mb-6 transition-colors duration-300 ${isDragging ? 'bg-molten-accent/20 text-molten-accent' : 'bg-molten-surface border border-molten-border text-molten-textSecondary'}`}>
              <UploadCloud size={40} strokeWidth={1.5} />
            </div>
            <div className="text-xl font-medium mb-2">Drop a .wav file here</div>
            <div className="font-mono text-sm text-molten-textSecondary uppercase tracking-widest mb-6">or click to browse</div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-molten-spoof font-mono text-sm px-4 py-2 bg-molten-spoof/10 rounded-md border border-molten-spoof/30"
              >
                {error}
              </motion.div>
            )}
          </label>
        </motion.div>
      </motion.section>

      {/* Feature Highlights Section */}
      <motion.section 
        className="min-h-[80vh] w-full max-w-5xl flex flex-col items-center justify-center py-20 z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-16 text-center text-molten-textPrimary">
          How Sonara Works
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <motion.div variants={itemVariants} className="premium-card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform duration-300">
            <Activity className="text-molten-accent mb-6" size={32} />
            <h3 className="text-xl font-semibold mb-3">Spectral Analysis</h3>
            <p className="text-molten-textSecondary text-sm font-mono leading-relaxed">
              We analyze the high-frequency spectral artifacts that generative models leave behind.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="premium-card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform duration-300">
            <BrainCircuit className="text-molten-accent mb-6" size={32} />
            <h3 className="text-xl font-semibold mb-3">Neural Heuristics</h3>
            <p className="text-molten-textSecondary text-sm font-mono leading-relaxed">
              Deep learning models detect unnatural vocal tract resonance and phase anomalies.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="premium-card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform duration-300">
            <ShieldCheck className="text-molten-accent mb-6" size={32} />
            <h3 className="text-xl font-semibold mb-3">Authenticity Verified</h3>
            <p className="text-molten-textSecondary text-sm font-mono leading-relaxed">
              Receive a definitive confidence score indicating if the audio is human or synthetic.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="w-full py-12 flex items-center justify-center border-t border-molten-border/30 z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={sectionVariants}
      >
        <motion.div variants={itemVariants} className="font-mono text-xs text-molten-textSecondary uppercase tracking-widest">
          Sonara Deepfake Detection © {new Date().getFullYear()}
        </motion.div>
      </motion.footer>

    </div>
  );
}
