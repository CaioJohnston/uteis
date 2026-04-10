import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        // dark palette
        ink: {
          DEFAULT: "#0c0b0a",
          surface: "#141312",
          border: "#252320",
          muted: "#3d3b38",
        },
        // light palette
        paper: {
          DEFAULT: "#fafaf8",
          surface: "#f2f0ec",
          border: "#e2dfd8",
          muted: "#a8a49c",
        },
        gold: {
          DEFAULT: "rgb(var(--gold) / <alpha-value>)",
          light: "#d9885a",
          dark: "#9a4918",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
