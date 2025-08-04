/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize:{
        base:'0.875rem', // 14px
      },
    },
  },
  plugins: [],
};
