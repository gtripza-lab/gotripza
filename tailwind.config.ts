import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1020",
          900: "#10172E",
          800: "#161F3D",
          700: "#1F2A4E",
        },
        brand: {
          primary: "#5A6CFF",
          deep: "#085CFF",
          mint: "#00D4B3",
          violet: "#8B5CF6",
        },
        surface: {
          DEFAULT: "#0B1020",
          glass: "rgba(255,255,255,0.04)",
          glassStrong: "rgba(255,255,255,0.08)",
        },
        paper: "#F6F8FF",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #5A6CFF 0%, #8B5CF6 50%, #00D4B3 100%)",
        "gradient-hero":
          "radial-gradient(ellipse at top, rgba(90,108,255,0.25) 0%, rgba(11,16,32,0) 60%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(90,108,255,0.45)",
        glowMint: "0 0 60px -10px rgba(0,212,179,0.45)",
        card: "0 8px 32px rgba(8, 12, 30, 0.6)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        xl2: "1.25rem",
        "4xl": "2rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
        glow: "glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
