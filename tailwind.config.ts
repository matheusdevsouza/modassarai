import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          50: '#f4faf6',
          100: '#e4f3ea',
          200: '#c3e2cf',
          300: '#96c6aa',
          400: '#5f9a7b',
          500: 'var(--brand-forest)',
          600: '#0b2f1a',
          700: '#082215',
          800: '#051810',
          900: '#03100b',
        },
        sage: {
          50: '#f5f7f6',
          100: '#e4e8e6',
          200: '#c7d0cc',
          300: '#a3b0ab',
          400: '#7e908a',
          500: 'var(--brand-sage)',
          600: '#3a4542',
          700: '#2b3431',
          800: '#1e2422',
          900: '#141817',
        },
        sand: {
          50: '#FDF8F2',
          100: 'var(--brand-sand)',
          200: '#e5ddd2',
          300: '#ccc6bc',
          400: '#b3afa5',
          500: '#9a9891',
        },
        cloud: {
          100: 'var(--brand-cloud)',
          200: '#c0c0c0',
          300: '#a6a6a6',
          400: '#8c8c8c',
          500: '#737373',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
export default config 