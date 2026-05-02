/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6B00', // Main brand color - Oilfield Orange
          600: '#E65100',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        },
        secondary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#d4b8a6',
          400: '#b78d6f',
          500: '#8B4513', // Saddle Brown
          600: '#7a3d11',
          700: '#5c2d0e',
          800: '#3d1e09',
          900: '#1f0f05'
        },
        background: '#F5F7FA',
        surface: '#FFFFFF',
        text: {
          primary: '#2C3E50',
          secondary: '#64748b',
          muted: '#94a3b8'
        },
        success: '#2ECC71',
        warning: '#F1C40F',
        error: '#E74C3C',
        info: '#3498DB',
        // Dark mode specific
        dark: {
          bg: '#0f1419',
          surface: '#1a1f26',
          card: '#242b33',
          border: '#2f3943',
          text: '#e7e9ea',
          muted: '#8899a6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'dark-card': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'dark-card-hover': '0 4px 12px rgba(0, 0, 0, 0.5)'
      }
    }
  },
  plugins: []
};
