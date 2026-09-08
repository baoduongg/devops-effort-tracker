import { config } from "dotenv";
import axios from "axios";

config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

// Same REST approach as scripts/seed.ts — avoids the gRPC transport issues
// the Firebase JS SDK's Node Firestore client hits on some Node versions.
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
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
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

async function writeDoc(collectionId: string, docId: string, data: Record<string, unknown>): Promise<void> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [key, value] of Object.entries(data)) {
    fields[key] = toFirestoreValue(value);
  }
  await axios.patch(`${baseUrl}/${collectionId}/${docId}?key=${apiKey}`, { fields });
}

async function findUserByEmail(email: string): Promise<{ id: string; data: Record<string, unknown> } | null> {
  const res = await axios.post(`${baseUrl}:runQuery?key=${apiKey}`, {
    structuredQuery: {
      from: [{ collectionId: "users" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "email" },
          op: "EQUAL",
          value: { stringValue: email },
        },
      },
      limit: 1,
    },
  });
  const match = res.data.find((r: { document?: unknown }) => r.document);
  if (!match) return null;
  const name: string = match.document.name;
  const id = name.substring(name.lastIndexOf("/") + 1);
  return { id, data: fromFirestoreFields(match.document.fields ?? {}) };
}

async function linkMember(): Promise<void> {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx scripts/link-member.ts <email> [displayName]");
    process.exit(1);
  }
  const displayName = process.argv[3] ?? email;

  const user = await findUserByEmail(email);
  if (!user) {
    console.error(`No users/ document found for email "${email}". Sign in with Google at least once first.`);
    process.exit(1);
  }

  const existingMemberId = user.data.memberId as string | null;
  if (existingMemberId) {
    console.log(`User ${user.id} is already linked to member ${existingMemberId}. Nothing to do.`);
    return;
  }

  const memberId = `member-${user.id}`;
  const now = new Date();

  await writeDoc("members", memberId, {
    name: displayName,
    email,
    photoURL: (user.data.photoURL as string | null) ?? null,
    skills: [],
    status: "available",
    currentTaskId: null,
    effortMinutes: 0,
    updatedAt: now,
  });

  await writeDoc("users", user.id, {
    email,
    displayName,
    photoURL: (user.data.photoURL as string | null) ?? null,
    role: (user.data.role as string) ?? "devops",
    memberId,
    createdAt: (user.data.createdAt as string) ?? now.toISOString(),
  });

  console.log(`Linked users/${user.id} -> members/${memberId}`);
}

linkMember()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("link-member failed:", err.response?.data ?? err.message);
    process.exit(1);
  });
