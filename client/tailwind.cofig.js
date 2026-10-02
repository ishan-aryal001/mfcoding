```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          800: '#14203a',
          900: '#0d1526',
          950: '#080e1c',
        },
      },
      keyframes: {
        fade: {
          from: {
            opacity: '0',
            transform: 'translateY(6px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slide: {
          from: {
            opacity: '0',
            transform: 'translateY(24px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        fade: 'fade 0.4s ease both',
        slide: 'slide 0.25s ease both',
      },
    },
  },
  plugins: [],
};
```
