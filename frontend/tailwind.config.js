/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        surface: {
          base:    '#04060f',
          DEFAULT: '#080d1a',
          elevated:'#0d1425',
        },
      },
      boxShadow: {
        'glow-cyan':   '0 0 40px rgba(34, 211, 238, 0.15)',
        'glow-violet': '0 0 40px rgba(139, 92, 246, 0.15)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        'orb-float': {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%':      { transform: 'translate(30px,-20px) scale(1.05)' },
          '66%':      { transform: 'translate(-20px,15px) scale(0.95)' },
        },
      },
      animation: {
        'float': 'orb-float 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}