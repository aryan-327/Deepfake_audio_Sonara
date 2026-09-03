/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        molten: {
          base: '#0D0B0A',
          surface: '#1A1614',
          border: '#2A2422',
          accent: '#FF6B35', // Amber/Ember
          human: '#FFC857',  // Gold
          spoof: '#E8384F',  // Crimson
          textPrimary: '#F5F1EC',
          textSecondary: '#9B948C'
        }
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-accent': '0 0 15px -3px rgba(255, 107, 53, 0.4), 0 0 6px -2px rgba(255, 107, 53, 0.2)',
        'glow-human': '0 0 15px -3px rgba(255, 200, 87, 0.4), 0 0 6px -2px rgba(255, 200, 87, 0.2)',
        'glow-spoof': '0 0 15px -3px rgba(232, 56, 79, 0.4), 0 0 6px -2px rgba(232, 56, 79, 0.2)',
        'inner-surface': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'drifting': 'drifting 8s ease-in-out infinite alternate',
      },
      keyframes: {
        drifting: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-10px) scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
