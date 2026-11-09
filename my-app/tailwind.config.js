/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#141214',
        foreground: '#fcf4f0',
        muted: '#2a2628',
        border: 'rgba(252, 244, 240, 0.16)',
        primary: '#6d0101',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // Keep existing CSS Modules / global resets from fighting a full Tailwind preflight wipe.
    preflight: false,
  },
};
