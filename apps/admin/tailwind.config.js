/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ek-deep": "#0d3b2e",
        "ek-mid": "#0a2620",
        "ek-dark": "#050508",
        "ek-gold": "#c9a84c",
        "ek-gold-bright": "#e8a020",
        "ek-gold-light": "#f5d080",
        "ek-ivory": "#f5f0e8",
      },
      fontFamily: {
        heading: ['"Cinzel Decorative"', "serif"],
        subheading: ['"Cinzel"', "serif"],
        body: ['"Lato"', "sans-serif"],
        numeric: ['"Orbitron"', "monospace"],
      },
    },
  },
  plugins: [],
};
