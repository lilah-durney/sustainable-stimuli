/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      textShadow: {
        sm: '1px 1px 2px rgba(0,0,0,0.25)',
        DEFAULT: '2px 2px 4px rgba(0,0,0,0.3)',
        lg: '3px 3px 6px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [
    require('tailwindcss-textshadow')
  ],
}

