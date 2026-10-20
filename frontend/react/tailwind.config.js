/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        // Uzum-binafsha asosli palitra (matn oq). Konfet ranglari cyberkid.css da.
        neutral: {
          50: '#131b36', 100: '#1a2447', 200: '#243262', 300: '#2b3a78',
          400: '#9fb0e6', 500: '#aebbe8', 600: '#e1e8ff', 700: '#f3f6ff',
          800: '#ffffff', 900: '#ffffff', 950: '#070b18',
        },
      },
    },
  },
  plugins: [],
}
