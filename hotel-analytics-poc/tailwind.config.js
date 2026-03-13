/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        border: {
          default: 'var(--border-default)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          success: 'var(--accent-success)',
          warning: 'var(--accent-warning)',
          danger: 'var(--accent-danger)',
          gold: '#D4A843',
        },
        navy: {
          50: '#E8EDF5',
          100: '#C5D0E6',
          200: '#9BAFD4',
          300: '#708EC2',
          400: '#5075B4',
          500: '#305CA6',
          600: '#2B549E',
          700: '#244A93',
          800: '#1A3A7A',
          900: '#0F2756',
          950: '#0A1628',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'kpi-value': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'kpi-label': ['0.75rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.05em' }],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
        'counter': 'counter 1.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-right': 'slide-right 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'bounce-dot': 'bounce-dot 1.4s infinite ease-in-out both',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '80%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-right': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-gold': '0 0 20px rgba(212, 168, 67, 0.2)',
      },
    },
  },
  plugins: [],
};
