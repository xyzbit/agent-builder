import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        mono: [
          "Monaco",
          "Consolas",
          "Menlo",
          "monospace"
        ],
        code: [
          "Consolas",
          "Monaco",
          "Courier New",
          "monospace"
        ]
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // CLI Theme Colors
        'cli-teal': '#2A9D8F',
        'cli-coral': '#F4A261',
        'cli-yellow': '#E9C46A',
        'cli-dark': '#264653',
        'cli-light': '#E76F51',
        'cli-bg': '#1a1a1a',
        'cli-terminal': '#0d1117',
        'cli-green': '#00ff41',
        'cli-amber': '#ffb000',
        
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "glow": {
          "0%": {
            "box-shadow": "0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)",
          },
          "100%": {
            "box-shadow": "0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)",
          },
        },
        "float": {
          "0%, 100%": { "transform": "translateY(0px)" },
          "50%": { "transform": "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { "background-position": "-1000px 0" },
          "100%": { "background-position": "1000px 0" },
        },
        "typing": {
          "from": { "width": "0" },
          "to": { "width": "100%" }
        },
        "blink": {
          "0%, 50%": { "opacity": "1" },
          "51%, 100%": { "opacity": "0" }
        },
        "terminal-glow": {
          "0%, 100%": { 
            "box-shadow": "0 0 5px #2A9D8F, 0 0 10px #2A9D8F, 0 0 15px #2A9D8F",
            "border-color": "#2A9D8F"
          },
          "50%": { 
            "box-shadow": "0 0 10px #2A9D8F, 0 0 20px #2A9D8F, 0 0 30px #2A9D8F",
            "border-color": "#F4A261"
          }
        }
      },
      boxShadow: {
        "glow": "0 0 20px rgba(59, 130, 246, 0.5)",
        "glow-sm": "0 0 10px rgba(59, 130, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(59, 130, 246, 0.6)",
        "premium": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "premium-sm": "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
        "premium-lg": "0 35px 60px -12px rgba(0, 0, 0, 0.35)",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "inner-glow": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)",
        "terminal": "0 0 20px rgba(42, 157, 143, 0.3), inset 0 0 20px rgba(42, 157, 143, 0.1)",
        "cli-glow": "0 0 15px rgba(42, 157, 143, 0.5)"
      },
      backdropBlur: {
        "xs": "2px",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "typing": "typing 3.5s steps(40, end), blink 0.75s step-end infinite",
        "blink": "blink 1s infinite",
        "terminal-glow": "terminal-glow 2s ease-in-out infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
