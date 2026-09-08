import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    // ponytail: dev server for this session is already running on 3001 (3000 was
    // occupied by a stale process); matches the port QC used in qc-report.md.
    baseURL: "http://localhost:3001",
  },
});
