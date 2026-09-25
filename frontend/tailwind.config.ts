import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens connected dynamically to CSS variables with full alpha support
        "bg-void": "rgb(var(--bg-void) / <alpha-value>)",
        "bg-panel": "rgb(var(--bg-panel) / <alpha-value>)",
        "bg-panel-raised": "rgb(var(--bg-panel-raised) / <alpha-value>)",
        "border-hairline": "rgb(var(--border-hairline) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "accent-scan": "rgb(var(--accent-scan) / <alpha-value>)",
        "signal-critical": "rgb(var(--signal-critical) / <alpha-value>)",
        "signal-high": "rgb(var(--signal-high) / <alpha-value>)",
        "signal-medium": "rgb(var(--signal-medium) / <alpha-value>)",
        "signal-low": "rgb(var(--signal-low) / <alpha-value>)",
        "signal-resolved": "rgb(var(--signal-resolved) / <alpha-value>)",

        // Semantic aliases
        void: "rgb(var(--bg-void) / <alpha-value>)",
        panel: {
          DEFAULT: "rgb(var(--bg-panel) / <alpha-value>)",
          raised: "rgb(var(--bg-panel-raised) / <alpha-value>)",
        },
        hairline: "rgb(var(--border-hairline) / <alpha-value>)",
        primary: "rgb(var(--text-primary) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        scan: "rgb(var(--accent-scan) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-sans-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
      },
      boxShadow: {
        // Strictly no drop shadows according to GEMINI.md
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
