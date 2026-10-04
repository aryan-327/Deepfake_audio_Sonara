import React, { useRef, useState, useEffect } from 'react';

export default function InteractiveWaveform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bars, setBars] = useState<{ id: number; height: number; delay: number; width: number; gap: number }[]>([]);
  const [mouseX, setMouseX] = useState<number | null>(null);

  // Generate bars once on mount
  useEffect(() => {
    const numBars = 160;
    const newBars = Array.from({ length: numBars }).map((_, i) => {
      // Create a sine wave envelope so the center is generally taller than the edges
      const normalizedPos = i / numBars; // 0 to 1
      const envelope = Math.sin(normalizedPos * Math.PI); 
      
      // Add Perlin-like noise (just using random + sine)
      const noise = (Math.random() * 0.4 + 0.6); 
      
      // Base height varies from 10% to 90%, strongly influenced by the envelope
      const baseHeight = Math.max(10, envelope * noise * 90);

      return {
        id: i,
        height: baseHeight,
        delay: Math.random() * 2,
        width: Math.random() > 0.7 ? 3 : (Math.random() > 0.4 ? 2 : 4), // 2-4px
        gap: Math.random() > 0.5 ? 2 : (Math.random() > 0.2 ? 1 : 3), // 1-3px
      };
    });
    setBars(newBars);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setMouseX(x);
  };

  const handleMouseLeave = () => {
    setMouseX(null);
  };

  return (
    <div 
      ref={containerRef}
      className="w-[150vw] h-48 md:h-80 flex items-center justify-center absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden px-4"
      style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Massive blurred radial glow (Atmospheric depth) */}
      <div className="absolute inset-0 bg-[#FF6B35]/20 blur-[120px] rounded-full scale-[2] pointer-events-none" />
      
      {bars.map((bar, i) => {
        let scale = 1;
        let brightness = 1;

        if (mouseX !== null && containerRef.current) {
          const totalWidth = containerRef.current.offsetWidth - 32; // rough padding
          const barX = (i / bars.length) * totalWidth;
          const distance = Math.abs(barX - mouseX);
          
          if (distance < 120) {
            const factor = 1 - distance / 120;
            scale = 1 + factor * 0.4;
            brightness = 1 + factor * 0.6; 
          }
        }

        return (
          <div
            key={bar.id}
            className="flex items-center justify-center relative z-10"
            style={{
              width: `${bar.width}px`,
              marginRight: `${bar.gap}px`,
              height: `${bar.height}%`,
              // Replace external height animation with a local transform pulse to ensure centered scaling
              animation: `pulseScale 2s ease-in-out ${bar.delay}s infinite alternate`,
            }}
          >
            <div 
              className="w-full h-full rounded-full transition-all duration-75 origin-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.9) 50%, rgba(255,107,53,0.2) 100%)',
                transform: `scaleY(${scale})`,
                filter: `brightness(${brightness})`,
              }}
            />
          </div>
        );
      })}
      
      {/* Add inline keyframes to override whatever waveformPulse was doing with height */}
      <style>{`
        @keyframes pulseScale {
          0% { transform: scaleY(0.85); opacity: 0.8; }
          100% { transform: scaleY(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
