/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        counting: { bg: '#FDE68A', accent: '#F59E0B' },
        place: { bg: '#EDE9FE', accent: '#7C3AED' },
        addition: { bg: '#D1FAE5', accent: '#059669' },
        subtraction: { bg: '#FEF3C7', accent: '#D97706' },
        multiply: { bg: '#DBEAFE', accent: '#2563EB' },
        division: { bg: '#FEE2E2', accent: '#DC2626' },
        fractions: { bg: '#F5F3FF', accent: '#6D28D9' },
        algebraic: { bg: '#CCFBF1', accent: '#0D9488' },
        numbersense: { bg: '#E0E7FF', accent: '#4338CA' },
      },
    },
  },
  plugins: [],
}
