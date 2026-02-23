import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FDFBF7",
          "bg-soft": "#FAF7F2",
          "bg-warm": "#FBF3E9",
          "bg-accent": "#EFECEA",
          "bg-teal": "#EBF6F6",
          "bg-peach": "#FFF4EE",
          "bg-sage": "#F0F4ED",
          "bg-dark": "#0F0D0B",
          "bg-dark-soft": "#1A1714",
          "bg-dark-card": "#252220",
        },
        teal: {
          DEFAULT: "#0D7377",
          light: "#14919B",
          soft: "#E6F4F4",
          dark: "#065A5E",
        },
        terra: {
          DEFAULT: "#C4704B",
          light: "#E8956D",
          soft: "#FDF0EA",
        },
        gold: "#B8860B",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Outfit'", "-apple-system", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28,25,23,0.04), 0 2px 8px rgba(28,25,23,0.02)",
        medium: "0 2px 4px rgba(28,25,23,0.04), 0 8px 24px rgba(28,25,23,0.04)",
        large: "0 4px 8px rgba(28,25,23,0.04), 0 16px 48px rgba(28,25,23,0.06)",
        xl: "0 8px 16px rgba(28,25,23,0.06), 0 32px 64px rgba(28,25,23,0.08)",
        teal: "0 8px 32px rgba(13,115,119,0.15), 0 2px 8px rgba(13,115,119,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
