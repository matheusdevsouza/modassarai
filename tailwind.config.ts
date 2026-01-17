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
          50: '#FDF8F2',
          100: '#F5EDE3',
          200: '#E8D9CC',
          300: '#D4B896',
          400: '#C49769',
          500: '#C49769',  // Main beige - Modas Saraí
          600: '#A0825C',
          700: '#8B7050',
          800: '#6B5540',
          900: '#4A3A2D',
        },
        sage: {
          50: '#F5F3F0',
          100: '#E8E6E3',
          200: '#D3D3D1',
          300: '#A8A5A0',
          400: '#8B8680',
          500: '#6B6660',  // Warm gray
          600: '#4A4540',
          700: '#2D2A27',
          800: '#1A1815',
          900: '#020204',  // Near black
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