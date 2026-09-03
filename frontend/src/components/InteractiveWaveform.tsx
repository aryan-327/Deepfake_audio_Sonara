import React, { useRef, useState, useEffect } from 'react';

export default function InteractiveWaveform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bars, setBars] = useState<{ id: number; height: number; delay: number }[]>([]);
  const [mouseX, setMouseX] = useState<number | null>(null);

  // Generate bars once on mount
  useEffect(() => {
    const numBars = 50;
    const newBars = Array.from({ length: numBars }).map((_, i) => ({
      id: i,
      // Random base height between 10% and 80%
      height: Math.random() * 70 + 10,
      // Random animation delay
      delay: Math.random() * 2,
    }));
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
      className="w-full h-24 flex items-center justify-center gap-1 relative overflow-hidden px-4"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {bars.map((bar, i) => {
        // Calculate distance from cursor to this bar
        let scale = 1;
        let brightness = 1;

        if (mouseX !== null && containerRef.current) {
          const totalWidth = containerRef.current.offsetWidth - 32; // padding
          const barX = (i / bars.length) * totalWidth;
          const distance = Math.abs(barX - mouseX);
          
          // If within 60px, apply scale and brightness
          if (distance < 60) {
            const factor = 1 - distance / 60; // 0 to 1
            scale = 1 + factor * 0.5; // Scale up to 1.5x
            brightness = 1 + factor * 0.5; // Brighten up to 1.5x
          }
        }

        return (
          <div
            key={bar.id}
            className="w-2 flex items-center justify-center"
            style={{
              height: `${bar.height}%`,
              animation: `waveformPulse 1.5s ease-in-out ${bar.delay}s infinite alternate`,
            }}
          >
            <div 
              className="w-full h-full rounded-full bg-molten-accent transition-all duration-75 origin-center"
              style={{
                transform: `scaleY(${scale})`,
                filter: `brightness(${brightness})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
