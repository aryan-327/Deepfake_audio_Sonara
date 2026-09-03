import { useMemo } from 'react';

export default function AmbientBackground() {
  // Generate a random set of particles that drift around using CSS keyframes
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 5;
      const opacity = Math.random() * 0.15 + 0.05;

      return {
        id: i,
        size,
        x,
        y,
        duration,
        delay,
        opacity,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Waveform/glow backdrop - always animating */}
      <div 
        className="absolute w-[800px] h-[400px] rounded-full blur-3xl opacity-10"
        style={{ 
          background: 'radial-gradient(circle, rgba(255,107,53,0.4) 0%, rgba(0,0,0,0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'drift 15s ease-in-out infinite alternate',
        }}
      />
      <div 
        className="absolute w-[600px] h-[300px] rounded-full blur-3xl opacity-10"
        style={{ 
          background: 'radial-gradient(circle, rgba(255,200,87,0.3) 0%, rgba(0,0,0,0) 70%)',
          top: '30%',
          left: '60%',
          transform: 'translate(-50%, -50%)',
          animation: 'drift 20s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-molten-accent"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `drift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
