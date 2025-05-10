/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // THIS IS THE IMPORTANT LINE
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust if your file structure is different
  ],
  theme: {
    extend: {
      // You can add custom theme colors or variants here if needed
    },
  },
  plugins: [],
}