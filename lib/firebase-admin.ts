import { cert, getApps, getApp, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminDb: Firestore | null = null;

/**
 * Server-only Firestore client using a service account, so cron routes can write
 * without a signed-in Firebase Auth session (which client SDK writes require per
 * firestore.rules). Lazily initialized so a missing env var only breaks the
 * routes that actually need a write, not the whole server bundle.
 */
export function getAdminDb(): Firestore {
  if (adminDb) return adminDb;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY env var is required for server-side Firestore writes");
  }

  const app: App = getApps().length ? getApp() : initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
  adminDb = getFirestore(app);
  return adminDb;
}
