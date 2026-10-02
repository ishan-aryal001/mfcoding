/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: { navy: { 800: "#14203a", 900: "#0d1526", 950: "#080e1c" } },
      keyframes: {
        fade: {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "none" },
        },
        slide: {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "none" },
        },
      },
      animation: { fade: "fade .4s ease both", slide: "slide .25s ease both" },
    },
  },
  plugins: [],
};
