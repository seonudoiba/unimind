/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'cream': '#FFF8EA',
        'sun': '#F3A93E',
        'sun-dark': '#D6862A',
        'sky': '#6FC3E4',
        'grass': '#5DA377',
        'navy': '#33475B',
        'coral': '#E86A55',
      },
      fontFamily: {
        'baloo': ['"Baloo 2"', 'cursive'],
        'nunito': ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(51, 71, 91, 0.15)',
        'soft-hover': '0 15px 40px rgba(51, 71, 91, 0.25)',
      },
      animation: {
        'spin-slow': 'spin 40s linear infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'bounce-delay-1': 'bounce 1.8s ease-in-out infinite',
        'bounce-delay-2': 'bounce 1.8s ease-in-out 0.2s infinite',
        'bounce-delay-3': 'bounce 1.8s ease-in-out 0.4s infinite',
        'fade-in': 'fadeIn 0.5s ease',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.35)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}