import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-purple": "#a855f7",
        "neon-cyan": "#22d3ee",
        "neon-pink": "#f472b6",
        "panel": "#111827",
        "panel-2": "#0f172a",
        "panel-border": "#1f2937"
      },
      boxShadow: {
        glow: "0 0 30px rgba(168, 85, 247, 0.25)",
        glowCyan: "0 0 24px rgba(34, 211, 238, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
