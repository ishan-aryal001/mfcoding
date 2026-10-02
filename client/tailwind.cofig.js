/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5bcfc",
          400: "#8199f8",
          500: "#6075f1",
          600: "#4657e5",
          700: "#3946d0",
          800: "#303baa",
          900: "#2b3587",
          950: "#151b3d",
        },
      },
    },
  },

  plugins: [],
};
