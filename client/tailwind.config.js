/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        graph: {
          bg: '#0b0f19',
          card: '#111827',
          border: '#1f293d',
          gold: '#f59e0b',
          blue: '#3b82f6',
          emerald: '#10b981',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          pink: '#ec4899',
          rose: '#f43f5e'
        }
      }
    },
  },
  plugins: [],
}
