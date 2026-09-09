import { config } from "dotenv";
import axios from "axios";

config({ path: ".env.local" });

// ponytail: one-off backfill for ISSUE-15/F-11 — patches `members/<memberId>.role` for existing
// members created before linkOrCreateUser started writing `role`. Not part of the app; run once
// via `npx tsx scripts/_backfill-member-role.ts` then delete (same convention as ISSUE-04's
// _cleanup-dup-overdue-notifications.ts).

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values: FirestoreValue[] } };

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  if (typeof value === "boolean") return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  throw new Error(`Unsupported value type: ${JSON.stringify(value)}`);
}

function fromFirestoreFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if ("stringValue" in value) out[key] = value.stringValue;
    else if ("integerValue" in value) out[key] = Number(value.integerValue);
    else if ("booleanValue" in value) out[key] = value.booleanValue;
    else if ("nullValue" in value) out[key] = null;
    else if ("timestampValue" in value) out[key] = value.timestampValue;
    else if ("arrayValue" in value) out[key] = (value.arrayValue.values ?? []).map((v) => fromFirestoreFields({ v })["v"]);
  }
  return out;
}

async function patchRole(memberId: string, role: string): Promise<void> {
  await axios.patch(
    `${baseUrl}/members/${memberId}?updateMask.fieldPaths=role&key=${apiKey}`,
    { fields: { role: toFirestoreValue(role) } }
  );
}

async function listAll(collectionId: string): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  const out: Array<{ id: string; data: Record<string, unknown> }> = [];
  let pageToken: string | undefined;
  do {
    const res = await axios.get(`${baseUrl}/${collectionId}`, {
      params: { key: apiKey, pageSize: 300, pageToken },
    });
    for (const doc of res.data.documents ?? []) {
      const id = doc.name.substring(doc.name.lastIndexOf("/") + 1);
      out.push({ id, data: fromFirestoreFields(doc.fields ?? {}) });
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return out;
}

async function backfill(): Promise<void> {
  const [users, members] = await Promise.all([listAll("users"), listAll("members")]);
  const membersById = new Map(members.map((m) => [m.id, m]));

  let patched = 0;
  let skipped = 0;
  for (const user of users) {
    const memberId = user.data.memberId as string | null;
    const role = (user.data.role as string) ?? "devops";
    if (!memberId) continue;
    const member = membersById.get(memberId);
    if (!member) continue;
    if (member.data.role) {
      skipped++;
      continue;
    }
    await patchRole(memberId, role);
    console.log(`Patched members/${memberId} -> role: ${role} (from users/${user.id})`);
    patched++;
  }

  console.log(`Done. Patched ${patched} member doc(s), skipped ${skipped} (already had role).`);
}

backfill()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("backfill-member-role failed:", err.response?.data ?? err.message);
    process.exit(1);
  });
