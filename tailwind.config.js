/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './blogs/**/*.html',
    './script.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      // No `colors` block: the system is monochrome by binding commitment
      // (DESIGN.md, The No-Color Rule). A blue `primary` ramp lived here unused
      // and read as permission to introduce a hue.
    },
  },
  plugins: [],
};
