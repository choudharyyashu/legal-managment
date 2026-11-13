/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#06244B',
          'navy-dark': '#041833',
          'navy-light': '#0B356D',
          cream: '#F5F0E5',
          'cream-light': '#FAF7F0',
          'cream-dark': '#EBE4D5',
          terracotta: '#A4432B',
          'terracotta-hover': '#8B3824',
          'terracotta-light': '#F8ECE9',
          blueGrey: '#B8C0C4',
          'blueGrey-light': '#E2E6E8',
          'blueGrey-dark': '#7B8890',
        },
        charcoal: {
          DEFAULT: '#202A35',
          light: '#374758',
          dark: '#141B22',
        },
        status: {
          success: '#287A55',
          'success-bg': '#EAF5EF',
          warning: '#A66A16',
          'warning-bg': '#FEF7EC',
          danger: '#B42318',
          'danger-bg': '#FDF2F2',
          info: '#315F8C',
          'info-bg': '#EFF5FA',
        },
        border: {
          default: '#D9D6CF',
          light: '#EBE7DF',
          dark: '#B8C0C4',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'Lato', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(6, 36, 75, 0.05), 0 1px 2px 0 rgba(6, 36, 75, 0.03)',
        card: '0 4px 6px -1px rgba(6, 36, 75, 0.06), 0 2px 4px -1px rgba(6, 36, 75, 0.04)',
        elevated: '0 10px 15px -3px rgba(6, 36, 75, 0.08), 0 4px 6px -2px rgba(6, 36, 75, 0.04)',
      }
    },
  },
  plugins: [],
}

