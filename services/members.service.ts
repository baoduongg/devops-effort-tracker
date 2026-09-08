import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Member, MemberInput } from "@/types/member";

import { toIsoString } from "@/lib/date";

const membersCol = collection(db, "members");

function toMember(id: string, data: Record<string, unknown>): Member {
  return {
    id,
    name: (data.name as string) ?? "Member",
    email: (data.email as string) ?? "",
    photoURL: (data.photoURL as string | null) ?? null,
    skills: (data.skills as string[]) ?? [],
    status: (data.status as Member["status"]) ?? "available",
    currentTaskId: (data.currentTaskId as string | null) ?? null,
    effortMinutes:
      typeof data.effortMinutes === "number"
        ? data.effortMinutes
        : typeof data.effortPercent === "number"
          ? Math.round((data.effortPercent / 100) * 480)
          : 0,
    role: (data.role as Member["role"]) ?? undefined,
    updatedAt: toIsoString(data.updatedAt),
  };
}

export async function getMembers(): Promise<Member[]> {
  const snapshot = await getDocs(membersCol);
  return snapshot.docs.map((d) => toMember(d.id, d.data()));
}

export async function getMember(id: string): Promise<Member | null> {
  const snapshot = await getDoc(doc(db, "members", id));
  if (!snapshot.exists()) return null;
  return toMember(snapshot.id, snapshot.data());
}

export async function createMember(input: MemberInput): Promise<string> {
  const ref = await addDoc(membersCol, { ...input, updatedAt: Timestamp.now() });
  return ref.id;
}

export async function updateMember(id: string, input: Partial<MemberInput>): Promise<void> {
  await setDoc(doc(db, "members", id), { ...input, updatedAt: Timestamp.now() }, { merge: true });
}

export async function deleteMember(id: string): Promise<void> {
  await deleteDoc(doc(db, "members", id));
}

export function subscribeMembers(callback: (members: Member[]) => void): () => void {
  return onSnapshot(membersCol, (snapshot) => {
    callback(snapshot.docs.map((d) => toMember(d.id, d.data())));
  });
}

export function findMemberByName(allMembers: Member[], targetName?: string | null): Member | null {
  if (!targetName || !targetName.trim() || !allMembers || allMembers.length === 0) return null;

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const stripHonorifics = (s: string) =>
    s
      .replace(/^(chu|anh|chi|em|ban|bac|ong|thay)\s+/gi, "")
      .replace(/\s+(cuu nan|support|fix|xu ly|lam)$/gi, "")
      .trim();

  const queryNorm = normalize(targetName);
  if (!queryNorm) return null;

  const cleanedQuery = stripHonorifics(queryNorm);

  // 1. Exact normalized match (original or cleaned)
  const exact =
    allMembers.find((m) => normalize(m.name) === queryNorm) ||
    allMembers.find((m) => normalize(m.name) === cleanedQuery);
  if (exact) return exact;

  // 2. Substring match
  const sub = allMembers.find((m) => {
    const mNorm = normalize(m.name);
    return (
      mNorm.includes(queryNorm) ||
      queryNorm.includes(mNorm) ||
      (cleanedQuery && (mNorm.includes(cleanedQuery) || cleanedQuery.includes(mNorm)))
    );
  });
  if (sub) return sub;

  // 3. Word overlap match (e.g. "Dương Bao 98" vs "Bao Duong")
  const queryWords = (cleanedQuery || queryNorm).split(" ").filter((w) => w.length > 1);
  let bestMatch: Member | null = null;
  let maxMatchedWords = 0;

  for (const m of allMembers) {
    const mWords = normalize(m.name).split(" ").filter((w) => w.length > 1);
    const matchedCount = queryWords.filter((w) => mWords.some((mw) => mw.includes(w) || w.includes(mw))).length;
    if (matchedCount > maxMatchedWords && matchedCount >= 1) {
      maxMatchedWords = matchedCount;
      bestMatch = m;
    }
  }

  return bestMatch;
}

export function findBestSuitableMember(
  members: Member[],
  taskTitle = "",
  projectName = "",
  excludeMemberId?: string | null
): Member | null {
  if (!members || members.length === 0) return null;

  // Filter candidate pool: prioritize DevOps engineers / non-leader members
  const nonLeaderMembers = members.filter((m) => m.role !== "leader" && (!excludeMemberId || m.id !== excludeMemberId));
  const pool = nonLeaderMembers.length > 0 ? nonLeaderMembers : members.filter((m) => !excludeMemberId || m.id !== excludeMemberId);

  const textToMatch = `${taskTitle} ${projectName}`.toLowerCase();

  const aliasMap: Record<string, string[]> = {
    aws: ["aws", "amazon", "ec2", "s3", "rds", "iam", "cloud"],
    kubernetes: ["kubernetes", "k8s", "eks", "aks", "gke", "cluster", "helm"],
    terraform: ["terraform", "iac", "infrastructure", "ansible"],
    "ci/cd": ["ci/cd", "pipeline", "gitlab", "github actions", "jenkins", "deploy", "build", "release"],
    docker: ["docker", "container", "image"],
    observability: ["observability", "grafana", "prometheus", "monitoring", "alert", "log", "metrics"],
    grafana: ["grafana", "prometheus", "dashboard", "metric"],
    prometheus: ["prometheus", "grafana", "alert", "metric"],
  };

  const scored = pool.map((m) => {
    let score = 0;

    // 1. Skill match (+20 for exact skill match, +15 for alias match)
    if (Array.isArray(m.skills)) {
      for (const rawSkill of m.skills) {
        if (!rawSkill) continue;
        const skill = rawSkill.toLowerCase();
        if (textToMatch.includes(skill)) {
          score += 20;
        } else {
          for (const [key, aliases] of Object.entries(aliasMap)) {
            if (skill.includes(key) || key.includes(skill)) {
              if (aliases.some((a) => textToMatch.includes(a))) {
                score += 15;
                break;
              }
            }
          }
        }
      }
    }

    // 2. Status score
    if (m.status === "available") {
      score += 20;
    } else if (m.status === "busy") {
      score += 5;
    } else if (m.status === "overloaded") {
      score -= 20;
    }

    // 3. Lower effort bonus (scaled against an 8h/480m workday)
    const effort = typeof m.effortMinutes === "number" ? m.effortMinutes : 0;
    score += Math.max(0, 10 - Math.round(effort / 48));

    return { member: m, score, effort };
  });

  scored.sort((a, b) => b.score - a.score || a.effort - b.effort);

  return scored[0]?.member ?? null;
}
