/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'acid-yellow': '#FFEB00',
        'hot-pink': '#FF0080',
        'electric-blue': '#0080FF',
        'success-green': '#00E566',
        'warning-orange': '#FF8000',
        'dark-gray': '#1A1A1A',
        'medium-gray': '#4D4D4D',
        'light-gray': '#E5E5E5',
      },
      fontFamily: {
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', 'monospace'],
      },
      boxShadow: {
        'brutalist': '4px 4px 0 #000',
        'brutalist-lg': '6px 6px 0 #000',
        'brutalist-sm': '3px 3px 0 #000',
      },
      borderRadius: {
        'brutalist': '4px',
      },
      animation: {
        'spring-in': 'springIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        springIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
