import type { Config } from "tailwindcss";

// Colors come from CSS variables (src/styles/globals.css) so light/dark switch automatically.
// `<alpha-value>` enables opacity modifiers such as bg-primary/10.
const withAlpha = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: withAlpha("background"),
        surface: withAlpha("surface"),
        border: withAlpha("border"),
        foreground: withAlpha("foreground"),
        muted: withAlpha("muted"),
        primary: withAlpha("primary"),
        success: withAlpha("success"),
        danger: withAlpha("danger"),
        warning: withAlpha("warning"),
        info: withAlpha("info"),
      },
      borderRadius: { card: "1.25rem" },
      boxShadow: { soft: "0 10px 30px -12px rgb(0 0 0 / 0.12)" },
      fontFamily: { sans: ["var(--font-poppins)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
