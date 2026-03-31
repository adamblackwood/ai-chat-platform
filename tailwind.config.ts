// تكوين Tailwind CSS مع الألوان المخصصة والخطوط العربية وانيميشن Radix
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6c63ff",
          50: "#eeedff",
          100: "#d4d2ff",
          200: "#b0adff",
          300: "#8c87ff",
          400: "#7a74ff",
          500: "#6c63ff",
          600: "#5a52e0",
          700: "#4840b8",
          800: "#372f90",
          900: "#261f68",
        },
        secondary: {
          DEFAULT: "#00d2ff",
          50: "#e0f9ff",
          100: "#b3f0ff",
          200: "#80e7ff",
          300: "#4ddeff",
          400: "#26d8ff",
          500: "#00d2ff",
          600: "#00b8e0",
          700: "#009ab8",
          800: "#007c90",
          900: "#005e68",
        },
        accent: {
          DEFAULT: "#f72585",
          50: "#ffe0ef",
          100: "#ffb3d4",
          200: "#ff80b6",
          300: "#ff4d98",
          400: "#ff2689",
          500: "#f72585",
          600: "#d91e73",
          700: "#b81760",
          800: "#90114d",
          900: "#680b3a",
        },
        dark: {
          DEFAULT: "#0f0f0f",
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#b8b8b8",
          300: "#8f8f8f",
          400: "#666666",
          500: "#3d3d3d",
          600: "#2a2a2a",
          700: "#1f1f1f",
          800: "#171717",
          900: "#0f0f0f",
          950: "#080808",
        },
      },
      fontFamily: {
        "sans-arabic": ["Cairo", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-in-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
