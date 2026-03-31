// إعدادات Tailwind CSS مع الثيم البنفسجي ودعم الوضع المظلم
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0effe',
          100: '#e0dffd',
          200: '#c2bffb',
          300: '#a39ff9',
          400: '#857ff7',
          500: '#6c63ff',
          600: '#5650e6',
          700: '#413dcc',
          800: '#2b29b3',
          900: '#161699',
          DEFAULT: '#6c63ff',
        },
        secondary: {
          50: '#e6fbff',
          100: '#ccf7ff',
          200: '#99efff',
          300: '#66e7ff',
          400: '#33dfff',
          500: '#00d2ff',
          600: '#00a8cc',
          700: '#007e99',
          800: '#005466',
          900: '#002a33',
          DEFAULT: '#00d2ff',
        },
        accent: {
          50: '#fef0f5',
          100: '#fde1eb',
          200: '#fbc3d7',
          300: '#f9a5c3',
          400: '#f787af',
          500: '#f72585',
          600: '#c61e6a',
          700: '#941750',
          800: '#630f35',
          900: '#31081b',
          DEFAULT: '#f72585',
        },
        dark: {
          50: '#f7f7f8',
          100: '#ededf0',
          200: '#d4d4db',
          300: '#b0b0bd',
          400: '#8c8c9e',
          500: '#6e6e82',
          600: '#57576b',
          700: '#3d3d50',
          800: '#2a2a3c',
          900: '#1a1a2e',
          950: '#0f0f1a',
          DEFAULT: '#1a1a2e',
        },
      },
      fontFamily: {
        'sans-arabic': ['Cairo', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.3s ease-in-out',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      spacing: {
        'sidebar': '280px',
      },
      zIndex: {
        'sidebar': '40',
        'header': '30',
        'overlay': '50',
        'modal': '60',
        'toast': '70',
      },
    },
  },
  plugins: [],
};

export default config;
