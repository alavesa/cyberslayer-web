import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        terminal: ['"VT323"', '"Courier New"', "monospace"],
      },
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
        cyber: {
          green: "hsl(var(--cyber-green))",
          pink: "hsl(var(--cyber-pink))",
          blue: "hsl(var(--cyber-blue))",
          yellow: "hsl(var(--cyber-yellow))",
          red: "hsl(var(--cyber-red))",
          dark: "hsl(var(--cyber-dark))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 4px hsl(var(--cyber-green) / 0.4)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 12px hsl(var(--cyber-green) / 0.6)" },
        },
        "damage-flash": {
          "0%": { boxShadow: "inset 0 0 0 rgba(255, 0, 0, 0)" },
          "30%": { boxShadow: "inset 0 0 30px rgba(255, 0, 0, 0.4)" },
          "100%": { boxShadow: "inset 0 0 0 rgba(255, 0, 0, 0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glitch": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.8" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.9" },
          "97%": { opacity: "1" },
        },
        "zone-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 2px hsl(var(--cyber-green) / 0.5)",
            backgroundColor: "hsl(var(--cyber-green) / 0.3)",
          },
          "50%": {
            boxShadow: "0 0 8px hsl(var(--cyber-green) / 0.8)",
            backgroundColor: "hsl(var(--cyber-green) / 0.6)",
          },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "damage-flash": "damage-flash 0.4s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "glitch": "glitch 0.3s ease-out",
        "flicker": "flicker 4s linear infinite",
        "zone-pulse": "zone-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
