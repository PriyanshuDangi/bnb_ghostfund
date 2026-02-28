import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // BNB-inspired golden yellow accent scale
        bnb: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F0B90B', // BNB brand yellow
          500: '#d4a20a',
          600: '#b8860a',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        // Premium dark surface system
        surface: {
          DEFAULT: '#0a0a0a',
          50: '#171717',
          100: '#141414',
          200: '#1a1a1a',
          300: '#222222',
          400: '#2a2a2a',
          500: '#333333',
          600: '#444444',
        },
        // Keep ghost alias for confirmed/success states (maps to BNB yellow now)
        ghost: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F0B90B',
          500: '#d4a20a',
          600: '#b8860a',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
          950: '#1c0f00',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glow':
          'radial-gradient(ellipse at 50% 0%, rgba(240,185,11,0.12) 0%, transparent 60%)',
        'gradient-mesh':
          'radial-gradient(ellipse at 20% 80%, rgba(240,185,11,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(240,185,11,0.04) 0%, transparent 50%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(240,185,11,0.15)',
        'glow-lg': '0 0 40px rgba(240,185,11,0.2)',
        'glow-sm': '0 0 10px rgba(240,185,11,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,185,11,0.1)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
