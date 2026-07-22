/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14151A',
          light: '#1F212A',
        },
        cream: '#FAF9F6',
        amber: {
          DEFAULT: '#C4622D',
          dark: '#A34F22',
          light: '#E08355',
        },
        sage: {
          DEFAULT: '#7A8B6F',
          dark: '#5F6E56',
        },
        slate: {
          DEFAULT: '#4A4D57',
          light: '#6B6E78',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(20, 21, 26, 0.06), 0 1px 2px rgba(20, 21, 26, 0.04)',
        'card-hover': '0 12px 24px rgba(20, 21, 26, 0.10), 0 4px 8px rgba(20, 21, 26, 0.06)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};

