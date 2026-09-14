"use client";

import { defineTheme } from "@astryxdesign/core/theme";

export const appTheme = defineTheme({
  name: "devops-tracker",
  color: {
    accent: "#3D7BFF",
    neutralStyle: "cool",
  },
  typography: {
    scale: { base: 14, ratio: 1.2 },
    body: {
      family: "Instrument Sans",
      fallbacks: "system-ui, -apple-system, sans-serif",
    },
    code: {
      family: "JetBrains Mono",
      fallbacks: "ui-monospace, 'SF Mono', Menlo, monospace",
    },
  },
  radius: { base: 4, multiplier: 1.0 },
  tokens: {
    "--color-accent": "#3D7BFF",
    "--color-on-accent": "#FFFFFF",
    "--color-background-body": "#08090C",
    "--color-background-surface": "#0D1014",
    "--color-background-card": "#0D1014",
    "--color-background-popover": "#12151C",
    "--color-background-muted": "#14171E",
    "--color-text-primary": "#E9ECF2",
    "--color-text-secondary": "#8B93A6",
    "--color-text-disabled": "#5C6478",
    "--color-icon-primary": "#E9ECF2",
    "--color-icon-secondary": "#8B93A6",
    "--color-border": "rgba(255,255,255,0.07)",
    "--color-border-emphasized": "rgba(255,255,255,0.10)",
    "--color-success": "#2FD98A",
    "--color-success-muted": "rgba(47,217,138,0.12)",
    "--color-warning": "#F5B93B",
    "--color-warning-muted": "rgba(245,185,59,0.12)",
    "--color-error": "#FF5C6C",
    "--color-error-muted": "rgba(255,92,108,0.12)",
    "--radius-page": "16px",
    "--radius-chat": "16px",
    "--radius-container": "13px",
    "--radius-element": "9px",
    "--radius-inner": "4px",
  },
  components: {
    "side-nav-item": {
      selected: {
        background: "linear-gradient(90deg, rgba(61,123,255,0.18), rgba(61,123,255,0.05))",
        borderColor: "rgba(61,123,255,0.30)",
        color: "#EAF0FF",
      },
    },
    button: {
      "variant:secondary": {
        backgroundColor: "var(--color-background-muted)",
        borderColor: "var(--color-border-emphasized)",
      },
    },
  },
});
