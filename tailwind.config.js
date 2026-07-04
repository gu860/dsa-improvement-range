/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#121212',
        'surface-2': '#1e1e1e',
        accent: '#f59e0b',
        'accent-glow': '#fbbf24',
      },
    },
  },
  plugins: [],
};
