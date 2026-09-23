import { defineConfig } from "vitest/config";
import { config as loadDotenv } from "dotenv";
import path from "path";

// ponytail: tests import services that eagerly init Firebase (lib/firebase.ts) via
// process.env.NEXT_PUBLIC_FIREBASE_*. Vitest doesn't auto-load .env.local like Next.js does,
// so load it into process.env here (dotenv is already a transitive dep).
loadDotenv({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
  },
});
