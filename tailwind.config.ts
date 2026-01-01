
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neon: {
          red: "#f21516",
          glow: "#ff171733",
        },
        tnj: {
          light: "#f2f2f2",
          dark: "#f21516",
        },
        podium: {
          gold: "#FFD700",
          silver: "#C0C0C0",
          bronze: "#CD7F32",
        },
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-out-bottom": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "led-flicker": {
          "0%, 100%": { opacity: "1.0" },
          "25%": { opacity: "0.9" },
          "50%": { opacity: "1.0" },
          "60%": { opacity: "0.95" },
          "75%": { opacity: "1.0" }, 
          "80%": { opacity: "0.92" },
          "90%": { opacity: "1.0" },
        },
        "score-pulse": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)", boxShadow: "0 0 30px rgba(242, 21, 22, 0.6)" },
          "100%": { transform: "scale(1)" },
        },
        "gradient-border": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "marquee": "marquee 60s linear infinite",
        "slide-in-bottom": "slide-in-bottom 0.6s ease-out",
        "slide-out-bottom": "slide-out-bottom 0.6s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-out": "fade-out 0.4s ease-out",
        "led-flicker": "led-flicker 3s infinite",
        "score-pulse": "score-pulse 0.6s ease-out",
        "gradient-border": "gradient-border 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
