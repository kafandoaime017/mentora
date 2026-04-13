/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{vue,ts}',
    './components/**/*.{vue,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#054348',
        secondary: '#709134',
        cream: '#fffcee',
        input: '#e7e7e7',
        danger: '#e53e3e',
        layout: '#f5f5f5',
      },
   fontFamily: {
  display: ['Syne', 'sans-serif'],
  body: ['Plus Jakarta Sans', 'sans-serif'],
},
    },
  },
  plugins: [],
}