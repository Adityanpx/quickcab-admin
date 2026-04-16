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
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
      },
      colors: {
        brand: {
          purple: "#5E5CE6",
          "purple-light": "#818CF8",
          "purple-dark": "#4338CA",
          "purple-muted": "#EEF2FF",
          "purple-muted-dark": "#1E1B4B",
          green: "#02E642",
          "green-muted": "#011A08",
          orange: "#FF9900",
          "orange-muted": "#2D1F00",
          red: "#FF453A",
          "red-muted": "#2D0A0A",
        },
        light: {
          bg: "#F5F6FA",
          surface: "#FFFFFF",
          "surface-2": "#F8F9FC",
          border: "#E5E7EB",
          "border-2": "#D1D5DB",
          text: "#111318",
          "text-2": "#6B7280",
          "text-3": "#9CA3AF",
        },
        dark: {
          bg: "#0D0F14",
          surface: "#1C1E26",
          "surface-2": "#111318",
          border: "#2A2D3A",
          "border-2": "#3A3D4A",
          text: "#F0F2F8",
          "text-2": "#8B8FA8",
          "text-3": "#5A5D70",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-in-up": "slideInUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "card-dark":
          "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
        "purple-glow": "0 0 20px rgba(94, 92, 230, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
