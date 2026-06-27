/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Occupy brand palette — territorial, slightly military
        territory: {
          red:    '#C0392B', // player 1
          blue:   '#1A5276', // player 2
          empty:  '#2C3E50', // unclaimed
          border: '#566573',
        },
        surface: {
          bg:     '#1C2833', // main background
          card:   '#212F3C', // panels
          raised: '#283747', // elevated elements
        },
        accent: '#F39C12', // gold — actions, CTAs
        text: {
          primary:   '#ECF0F1',
          secondary: '#AAB7B8',
          muted:     '#717D7E',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'flash-win':  'flashWin 0.6s ease-in-out',
        'flash-lose': 'flashLose 0.6s ease-in-out',
        'pulse-turn': 'pulseTurn 1.5s ease-in-out infinite',
      },
      keyframes: {
        flashWin: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4', backgroundColor: '#27AE60' },
        },
        flashLose: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4', backgroundColor: '#C0392B' },
        },
        pulseTurn: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(243,156,18,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(243,156,18,0.3)' },
        },
      },
    },
  },
  plugins: [],
};
