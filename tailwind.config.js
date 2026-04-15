/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        // Remap blue → Exos primary (#066dce)
        blue: {
          50:  '#eff7fe',
          100: '#dbeffe',
          200: '#b8dffd',
          300: '#7ac4fb',
          400: '#39a3f8',
          500: '#0f84ec',
          600: '#066dce', // Exos primary
          700: '#0559a8',
          800: '#0a4884',
          900: '#0a2845', // Exos dark
          950: '#071b30',
        },
        // Remap indigo → deep Exos navy range
        indigo: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#1a5fa0',
          600: '#0d4f8c',
          700: '#0a3d6e',
          800: '#082e54',
          900: '#071e3a',
          950: '#040f1e',
        },
        // Remap emerald → Exos success (#1c7c35)
        emerald: {
          50:  '#f6fde5',
          100: '#edfbcb',
          200: '#d5f59a',
          300: '#b2ec65',
          400: '#8ede38',
          500: '#1c7c35', // Exos success
          600: '#1c7c35',
          700: '#176229',
          800: '#124e21',
          900: '#0e3d1a',
          950: '#082611',
        },
        // Remap red → Exos danger (#cc3115)
        red: {
          50:  '#fff0f0',
          100: '#ffe2e0',
          200: '#ffcac6',
          300: '#ffa49e',
          400: '#ff6b60',
          500: '#cc3115', // Exos danger
          600: '#cc3115',
          700: '#a82710',
          800: '#8a210e',
          900: '#721f10',
          950: '#3e0c05',
        },
        // Remap amber → Exos warning (#f9a824)
        amber: {
          50:  '#fff4e1',
          100: '#ffe8be',
          200: '#ffd07c',
          300: '#ffb93a',
          400: '#f9a824', // Exos warning
          500: '#f9a824',
          600: '#e08910',
          700: '#b96a0b',
          800: '#975110',
          900: '#7c4311',
          950: '#482204',
        },
        // Remap yellow → same as amber for consistency
        yellow: {
          400: '#f9a824',
          500: '#f9a824',
        },
        // Remap slate → Exos neutral scale
        slate: {
          50:  '#f7f8fa', // Exos secondary-bg
          100: '#f1f3f5',
          200: '#e2e6ea',
          300: '#c8cfd7',
          400: '#8fa0ae',
          500: '#6b7e8d',
          600: '#4a5c6c', // Exos secondary
          700: '#4a5c6c', // Exos secondary
          800: '#2e3d4a',
          900: '#0a2845', // Exos dark
          950: '#071830',
        },
      },
    },
  },
  plugins: [],
}
