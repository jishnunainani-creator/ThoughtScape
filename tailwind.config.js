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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sticky: {
          yellow: '#FEF08A',
          yellowDark: '#FACC15',
          pink: '#FBCFE8',
          pinkDark: '#F472B6',
          green: '#BBF7D0',
          greenDark: '#4ADE80',
          blue: '#BAE6FD',
          blueDark: '#38BDF8',
          purple: '#E9D5FF',
          purpleDark: '#C084FC',
          peach: '#FED7AA',
          peachDark: '#FB923C',
          orange: '#FFEDD5',
          orangeDark: '#F97316',
          red: '#FECDD3',
          redDark: '#FB7185',
          white: '#F8FAFC',
          whiteDark: '#CBD5E1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        handwriting: ['Caveat', 'Patrick Hand', 'cursive'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.08), 0 10px 15px -3px rgba(0,0,0,0.04)',
        'paper-hover': '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.1), 0 18px 24px -4px rgba(0,0,0,0.06)',
        'paper-lifted': '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.05)',
        'paper-curl': '0 15px 10px -10px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1), 0 0 40px rgba(0, 0, 0, 0.05) inset',
      }
    },
  },
  plugins: [],
}
