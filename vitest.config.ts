import { defineConfig } from "vitest/config";
import { config as loadDotenv } from "dotenv";
import path from "path";

// ponytail: tests import services that eagerly init Firebase (lib/firebase.ts) via
// process.env.NEXT_PUBLIC_FIREBASE_*. Vitest doesn't auto-load .env.local like Next.js does,
// so load it into process.env here (dotenv is already a transitive dep). Load .env.local
// first (real values, gitignored, wins if present), then .env.test as a committed fallback —
// dotenv's config() doesn't override already-set keys, so a fresh clone/CI with no
// .env.local still gets working dummy values from .env.test.
loadDotenv({ path: path.resolve(__dirname, ".env.local") });
loadDotenv({ path: path.resolve(__dirname, ".env.test") });

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
