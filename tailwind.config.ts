import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C0392B',
          orange: '#E67E22',
          gold: '#D4AC0D',
          dark: '#0D0D0D',
          charcoal: '#1A1A1A',
          ember: '#FF4500',
        },
      },
      fontFamily: {
        display: ['Impact', 'Arial Black', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ember-gradient': 'radial-gradient(ellipse at center, #3d1a00 0%, #0d0d0d 70%)',
        'fire-gradient': 'linear-gradient(to bottom, #ff4500, #c0392b, #0d0d0d)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'price-pulse': {
          '0%, 100%': { textShadow: '0 0 10px #ff4500' },
          '50%': { textShadow: '0 0 25px #ff4500, 0 0 50px #ff4500' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'price-pulse': 'price-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
