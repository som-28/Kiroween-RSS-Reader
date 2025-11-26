/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base colors
        'haunted-black': '#0a0a0a',
        graveyard: '#1a1a1a',
        'graveyard-gray': '#1a1a1a',
        ghost: '#f0f0f0',
        fog: 'rgba(200, 200, 200, 0.7)',

        // Theme colors
        pumpkin: '#ff6b35',
        'pumpkin-light': '#ff8c5a',
        'pumpkin-dark': '#cc5529',

        'witch-purple': '#8a07d7',
        'witch-purple-light': '#a52fff',
        'witch-purple-dark': '#6a05a7',

        'poison-green': '#39ff14',
        'poison-green-light': '#5fff3d',
        'poison-green-dark': '#2acc10',

        'blood-red': '#8b0000',
        'blood-red-light': '#b30000',
        'blood-red-dark': '#5c0000',

        // Legacy support
        haunted: {
          black: '#0a0a0a',
          gray: '#1a1a1a',
          white: '#f0f0f0',
        },
        witch: {
          DEFAULT: '#8a07d7',
          light: '#a52fff',
          dark: '#6a05a7',
        },
        poison: {
          DEFAULT: '#39ff14',
          light: '#5fff3d',
          dark: '#2acc10',
        },
        blood: {
          DEFAULT: '#8b0000',
          light: '#b30000',
          dark: '#5c0000',
        },
      },
      fontFamily: {
        creepy: ['Creepster', 'cursive'],
        body: ['Inter', 'Roboto', 'sans-serif'],
        accent: ['Special Elite', 'monospace'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        flicker: 'flicker 3s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            opacity: '1',
          },
          '20%, 24%, 55%': {
            opacity: '0.4',
          },
        },
        glow: {
          from: {
            boxShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
          },
          to: {
            boxShadow: '0 0 20px rgba(255, 107, 53, 0.8)',
          },
        },
      },
    },
  },
  plugins: [],
};
