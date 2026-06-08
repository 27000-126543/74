/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        gold: {
          50: '#FBF8F1',
          100: '#F5EED9',
          200: '#EBDBB2',
          300: '#DEC289',
          400: '#D4AE66',
          500: '#C9A962',
          600: '#B08C3E',
          700: '#8C6E30',
          800: '#644F23',
          900: '#3D3015',
        },
        navy: {
          50: '#F0F3F7',
          100: '#D7DEE8',
          200: '#AEBCD0',
          300: '#7A91B0',
          400: '#4C678A',
          500: '#2D4465',
          600: '#1A2332',
          700: '#141B27',
          800: '#0E131B',
          900: '#080B10',
        },
        coral: {
          500: '#FF6B4A',
          600: '#E55439',
        },
        emerald: {
          500: '#2ECC71',
          600: '#27AE60',
        },
        wine: {
          500: '#8B2635',
          600: '#6E1E2A',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 8px 32px 0 rgba(201, 169, 98, 0.15)',
        'luxury-lg': '0 16px 48px 0 rgba(201, 169, 98, 0.2)',
        'card': '0 4px 24px 0 rgba(26, 35, 50, 0.3)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AE66 0%, #C9A962 50%, #B08C3E 100%)',
        'navy-gradient': 'linear-gradient(135deg, #2D4465 0%, #1A2332 50%, #141B27 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 169, 98, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(201, 169, 98, 0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
