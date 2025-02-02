/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#608ede',
        'szary': '#cac4d0',
        'hover-szary': '#b3aabb',
      },
    },
  },
  plugins: [],
}

