/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'temp-cold': '#3b82f6',
        'temp-normal': '#10b981',
        'temp-warm': '#f59e0b',
        'temp-hot': '#ef4444',
      }
    },
  },
  plugins: [],
}
