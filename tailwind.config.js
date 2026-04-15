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
        // Remap blue → Exos primary scale (from tokens.json primitives)
        blue: {
          10:  '#eff7fe', // blue10
          20:  '#e4f2fe', // blue20
          30:  '#bfdcf6', // blue30
          40:  '#9ac6ee', // blue40
          50:  '#eff7fe', // textActionLighter
          100: '#e4f2fe', // bgActionLight
          200: '#bfdcf6', // blue30
          300: '#9ac6ee', // blue40
          400: '#5099de', // blue60
          500: '#2b83d6', // blue70
          600: '#066dce', // bgActionPrimary (blue80)
          700: '#0559a9', // bgActionDark (blue100)
          800: '#0a4884',
          900: '#0a2845',
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
        // Remap slate → Exos neutral scale (from tokens.json primitives)
        slate: {
          50:  '#edf1f7', // bgDefaultScreen (blueGray)
          100: '#f0f2f5', // bgDefaultLight (subtleGray20)
          200: '#d8dfe6', // borderDefaultLighter (subtleGray40)
          300: '#bfcad5', // borderDefaultLight (subtleGray60)
          400: '#929faa', // subtleGray80
          500: '#687885', // textDefaultTertiary (gray60)
          600: '#66747f', // borderDefaultPrimary (subtleGray100)
          700: '#304258', // textDefaultSecondary (gray80)
          800: '#0a2845', // gray90
          900: '#05152a', // textDefaultPrimary (gray100)
          950: '#040d1e',
        },
      },
    },
  },
  plugins: [],
}
