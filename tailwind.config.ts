/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  mode: "jit",
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      background: {
        primary: {
          DEFAULT: "rgb(37,99,235)",
          dark: "rgb(30,64,175)",
        },
      },
      colors: {
        "black-100": "#2B2C35",
        primary: {
          DEFAULT: "rgb(37,99,235)",
          dark: "rgb(30,64,175)",
          "50": "#eff6ff",
          "100": "#dbeafe",
          "200": "#bfdbfe",
          "300": "#93c5fd",
          "400": "#60a5fa",
          "500": "#3b82f6",
          "600": "#2563eb",
          "700": "#1d4ed8",
          "800": "#1e40af",
          "900": "#1e3a8a",
          "950": "#172554",
        },
        "secondary-orange": "#f79761",
        "light-white": {
          DEFAULT: "rgba(59,60,152,0.03)",
          100: "rgba(59,60,152,0.02)",
        },
        grey: "#747A88",
      },
      backgroundImage: {
        pattern: "url('/pattern.JPG')",
        "hero-bg": "url('/hero-bg.png')",
        "layout-bg": "url('/hero.JPG')",
        "layout1-bg": "url('/about.JPG')",
        "parallax-bg": "url('/church.JPG')",
        "guitar-bg": "url('/guitar.png')",
      },
    },
  },
  plugins: [],
};
