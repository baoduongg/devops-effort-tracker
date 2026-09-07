"use client";

import { defineTheme } from "@astryxdesign/core/theme";

export const appTheme = defineTheme({
  name: "devops-tracker",
  color: { accent: ["#0076cc", "#46a6ef"], neutralStyle: "cool" },
  radius: { base: 4, multiplier: 1.0 },
  tokens: {
    "--radius-chat": "16px",
    "--radius-page": "16px",
    "--radius-container": "12px",
    "--radius-element": "8px",
    "--radius-inner": "4px",
  },
});
