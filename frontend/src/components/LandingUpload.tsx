import React, { useCallback, useState } from 'react';
import { UploadCloud, ShieldCheck, Activity, BrainCircuit, RefreshCw } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import InteractiveWaveform from './InteractiveWaveform';
import { convertToWav, isSupportedAudioFile } from '../utils/audioConverter';

interface LandingUploadProps {
  onUpload: (file: File) => void;
}

export default function LandingUpload({ onUpload }: LandingUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<string | null>(null);

  // Scroll logic for parallax
  const { scrollYProgress } = useScroll();
  
  // Foreground moves up slightly faster
  const yParallaxForeground = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const yParallaxMid = useTransform(scrollYProgress, [0, 1], [0, 80]);
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

  const processAudioFile = useCallback(async (selectedFile: File) => {
    setError(null);
    if (!isSupportedAudioFile(selectedFile)) {
      setError('Unsupported format. Please upload .wav, .mp3, .m4a, .ogg, .flac, or .aac');
      return;
    }

    try {
      setIsConverting(true);
      setConversionStatus(`Reading ${selectedFile.name}...`);

      const { file: wavFile, converted, originalFormat } = await convertToWav(
        selectedFile,
        (status) => setConversionStatus(status)
      );

      if (converted) {
        setConversionStatus(`Transcoded ${originalFormat} to 16kHz WAV standard. Continuing test...`);
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      setIsConverting(false);
      setConversionStatus(null);
      onUpload(wavFile);
    } catch (err: any) {
      console.error('Audio conversion error:', err);
      setIsConverting(false);
      setConversionStatus(null);
      setError(err?.message || 'Error processing audio file. Please try another format.');
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAudioFile(e.dataTransfer.files[0]);
    }
  }, [processAudioFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAudioFile(e.target.files[0]);
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
      


      {/* Layer 1: Background Parallax Element with Twinkling Particles */}
      <motion.div 
        style={{ y: yParallaxBackground }}
        className="absolute inset-0 pointer-events-none z-0 flex justify-center opacity-30"
      >
        <div className="w-full h-full relative">
           {/* Simulate a few distant stars/particles */}
           <div className="absolute top-[10%] left-[20%] w-1 h-1 rounded-full bg-white animate-twinkle" />
           <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 rounded-full bg-molten-accent animate-twinkle" style={{ animationDelay: '1s' }} />
           <div className="absolute top-[40%] left-[10%] w-0.5 h-0.5 rounded-full bg-white animate-twinkle" style={{ animationDelay: '2s' }} />
           <div className="absolute top-[60%] right-[30%] w-1 h-1 rounded-full bg-molten-accent animate-twinkle" style={{ animationDelay: '1.5s' }} />
        </div>
      </motion.div>

      {/* Layer 2: Midground Waveform */}
      <motion.div 
        style={{ y: yParallaxMid }}
        className="absolute top-[30vh] w-full z-10 pointer-events-none"
      >
        <InteractiveWaveform />
      </motion.div>

      {/* Layer 3: Foreground Hero Section */}
      <motion.section 
        className="min-h-screen w-full flex flex-col items-center justify-center pt-32 pb-24 z-20 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        style={{ y: yParallaxForeground }}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-10 opacity-70">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-molten-accent/50" />
          <span className="font-mono text-[10px] md:text-xs text-molten-textSecondary tracking-[0.3em] uppercase">
            Sonara · Acoustic Forensics
          </span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-molten-accent/50" />
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-20 relative z-10 flex flex-col items-center">
          <h1 className="flex flex-col items-center justify-center">
            <span className="text-2xl md:text-4xl font-medium tracking-wide text-[#F5F1EC]/70 drop-shadow-white-glow mb-2">
              Detect the synthetic.
            </span>
            <span className="text-6xl md:text-8xl font-bold tracking-tighter text-metallic-amber drop-shadow-amber-glow py-2">
              Verify the real.
            </span>
          </h1>
          <p className="text-molten-textSecondary/80 text-sm md:text-base font-mono tracking-widest translate-x-4 mt-6">
            Acoustic anomaly detection and deepfake analysis
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div 
          variants={itemVariants}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          animate={{ boxShadow: ['0 0 0 1px rgba(255, 200, 87, 0.1)', '0 0 24px 2px rgba(255, 200, 87, 0.15)', '0 0 0 1px rgba(255, 200, 87, 0.1)'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`bg-[#0A0807]/80 backdrop-blur-md rounded-xl w-full max-w-2xl p-14 flex flex-col items-center justify-center transition-all duration-300 relative -translate-x-4 border-gradient-amber ${
            isDragging ? 'scale-[1.02]' : 'hover:-translate-y-1'
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 border-[3px] border-molten-accent rounded-xl animate-sonar-ping pointer-events-none" />
          )}

          <input 
            type="file" 
            accept=".wav,.mp3,.m4a,.aac,.ogg,.flac,.webm" 
            onChange={handleChange}
            className="hidden" 
            id="audio-upload"
            disabled={isConverting}
          />
          <label 
            htmlFor="audio-upload" 
            className="flex flex-col items-center cursor-pointer w-full relative z-10"
          >
            <div className={`p-4 rounded-full mb-6 transition-colors duration-300 ${
              isConverting 
                ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_25px_rgba(255,170,0,0.3)] animate-pulse' 
                : isDragging 
                  ? 'bg-molten-accent/20 text-molten-accent shadow-[0_0_20px_rgba(255,200,87,0.3)]' 
                  : 'bg-[#110E0D] border border-molten-border text-molten-textSecondary hover:text-molten-accent hover:border-molten-accent/50'
            }`}>
              {isConverting ? (
                <RefreshCw size={40} strokeWidth={1.5} className="animate-spin text-amber-400" />
              ) : (
                <UploadCloud size={40} strokeWidth={1.5} />
              )}
            </div>

            {isConverting ? (
              <div className="flex flex-col items-center">
                <div className="text-xl font-medium mb-2 text-amber-300">Standardizing Audio Stream...</div>
                <div className="font-mono text-xs text-molten-textSecondary mb-2">{conversionStatus}</div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-amber-400/80 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Auto-transcoding to 16kHz PCM WAV
                </div>
              </div>
            ) : (
              <>
                <div className="text-xl font-medium mb-1 text-molten-textPrimary">Drop your audio file here</div>
                <div className="font-mono text-[11px] text-molten-textSecondary uppercase tracking-widest mb-3">or click to browse</div>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                  {['.WAV', '.MP3', '.M4A', '.FLAC', '.OGG', '.AAC'].map((fmt) => (
                    <span key={fmt} className="font-mono text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-molten-textSecondary/80">
                      {fmt}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-[10px] text-molten-accent/90 uppercase tracking-widest">
                  Auto-converted to forensic WAV · Processed locally
                </div>
              </>
            )}
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-molten-spoof font-mono text-sm px-4 py-2 mt-4 bg-molten-spoof/10 rounded-md border border-molten-spoof/30"
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
