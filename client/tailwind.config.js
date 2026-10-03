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
        gh: {
          canvas: '#0d1117',
          subtle: '#161b22',
          header: '#010409',
          border: '#30363d',
          'border-subtle': '#21262d',
          text: '#f0f6fc',
          muted: '#8b949e',
          link: '#58a6ff',
          green: '#238636',
          'green-hover': '#2ea043',
          'green-bright': '#3fb950',
          purple: '#8957e5',
          gold: '#d29922',
          red: '#f85149'
        }
      }
    },
  },
  plugins: [],
}
