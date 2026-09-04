import { config } from "dotenv";
import axios from "axios";

config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

// The Firebase JS SDK's Node Firestore client uses a gRPC transport that is
// unreliable on some Node versions; the REST API is a stable alternative for
// a one-off seed script and avoids that transport entirely.
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

async function writeDoc(collectionId: string, docId: string, data: Record<string, unknown>): Promise<void> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [key, value] of Object.entries(data)) {
    fields[key] = toFirestoreValue(value);
  }
  await axios.patch(`${baseUrl}/${collectionId}/${docId}?key=${apiKey}`, { fields });
}

async function seed(): Promise<void> {
  const now = new Date();

  const projects = [
    { id: "proj-atlas", name: "Atlas Migration", description: "Migrate legacy infra to Atlas cloud platform", color: "#6366f1" },
    { id: "proj-phoenix", name: "Phoenix CI/CD", description: "Rebuild CI/CD pipeline with faster caching", color: "#f59e0b" },
    { id: "proj-sentinel", name: "Sentinel Monitoring", description: "Roll out unified observability stack", color: "#10b981" },
  ];

  for (const p of projects) {
    await writeDoc("projects", p.id, {
      name: p.name,
      description: p.description,
      color: p.color,
      createdAt: now,
    });
  }

  const members = [
    { id: "member-linh", name: "Linh Tran", email: "linh.tran@example.com", photoURL: null, skills: ["Kubernetes", "Terraform", "AWS"], status: "busy", currentTaskId: "task-atlas-1", effortPercent: 80 },
    { id: "member-huy", name: "Huy Nguyen", email: "huy.nguyen@example.com", photoURL: null, skills: ["CI/CD", "Docker", "GitHub Actions"], status: "overloaded", currentTaskId: "task-phoenix-1", effortPercent: 110 },
    { id: "member-mai", name: "Mai Pham", email: "mai.pham@example.com", photoURL: null, skills: ["Observability", "Grafana", "Prometheus"], status: "available", currentTaskId: null, effortPercent: 20 },
  ];

  for (const m of members) {
    await writeDoc("members", m.id, {
      name: m.name,
      email: m.email,
      photoURL: m.photoURL,
      skills: m.skills,
      status: m.status,
      currentTaskId: m.currentTaskId,
      effortPercent: m.effortPercent,
      updatedAt: now,
    });
  }

  const nowMs = now.getTime();
  const day = 24 * 60 * 60 * 1000;
  const tasks = [
    { id: "task-atlas-1", memberId: "member-linh", projectId: "proj-atlas", title: "Migrate staging cluster to Atlas", description: "Move staging Kubernetes workloads to the new Atlas cluster", effortPercent: 60, status: "in_progress", startDate: new Date(nowMs - 3 * day), endDate: new Date(nowMs + 4 * day), source: "manual" },
    { id: "task-atlas-2", memberId: "member-linh", projectId: "proj-atlas", title: "Write Terraform modules for Atlas networking", description: "VPC, subnets, and security groups as reusable modules", effortPercent: 20, status: "planned", startDate: new Date(nowMs + 5 * day), endDate: new Date(nowMs + 10 * day), source: "manual" },
    { id: "task-phoenix-1", memberId: "member-huy", projectId: "proj-phoenix", title: "Rebuild pipeline caching layer", description: "Introduce remote build cache to cut CI time in half", effortPercent: 70, status: "in_progress", startDate: new Date(nowMs - 5 * day), endDate: new Date(nowMs + 2 * day), source: "manual" },
    { id: "task-phoenix-2", memberId: "member-huy", projectId: "proj-phoenix", title: "On-call rotation setup", description: "Configure PagerDuty rotation for pipeline incidents", effortPercent: 40, status: "in_progress", startDate: new Date(nowMs - 1 * day), endDate: new Date(nowMs + 6 * day), source: "manual" },
    { id: "task-sentinel-1", memberId: "member-mai", projectId: "proj-sentinel", title: "Evaluate Grafana Cloud vs self-hosted", description: "Cost and maintenance comparison for the observability stack decision", effortPercent: 20, status: "done", startDate: new Date(nowMs - 10 * day), endDate: new Date(nowMs - 2 * day), source: "manual" },
  ];

  for (const t of tasks) {
    await writeDoc("tasks", t.id, {
      memberId: t.memberId,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      effortPercent: t.effortPercent,
      status: t.status,
      startDate: t.startDate,
      endDate: t.endDate,
      source: t.source,
      createdAt: now,
      updatedAt: now,
    });
  }

  const notifications = [
    { id: "notif-1", type: "budget", title: "Atlas Migration nearing budget cap", message: "Atlas Migration has used 85% of its allocated cloud budget for this quarter.", severity: "warning", relatedProjectId: "proj-atlas", read: false },
    { id: "notif-2", type: "budget", title: "Phoenix CI/CD over budget", message: "Phoenix CI/CD has exceeded its monthly infra budget by 12%.", severity: "critical", relatedProjectId: "proj-phoenix", read: false },
    { id: "notif-3", type: "other", title: "Sentinel Monitoring milestone reached", message: "Evaluation phase completed ahead of schedule.", severity: "info", relatedProjectId: "proj-sentinel", read: true },
  ];

  for (const n of notifications) {
    await writeDoc("notifications", n.id, {
      type: n.type,
      title: n.title,
      message: n.message,
      severity: n.severity,
      relatedProjectId: n.relatedProjectId,
      read: n.read,
      createdAt: now,
    });
  }

  const users = [
    { id: "user-linh", email: "linh.tran@example.com", displayName: "Linh Tran", photoURL: null, role: "devops", memberId: "member-linh" },
    { id: "user-huy", email: "huy.nguyen@example.com", displayName: "Huy Nguyen", photoURL: null, role: "devops", memberId: "member-huy" },
    { id: "user-mai", email: "mai.pham@example.com", displayName: "Mai Pham", photoURL: null, role: "devops", memberId: "member-mai" },
    { id: "user-leader", email: "leader@example.com", displayName: "Team Leader", photoURL: null, role: "leader", memberId: null },
  ];

  for (const u of users) {
    await writeDoc("users", u.id, {
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      role: u.role,
      memberId: u.memberId,
      createdAt: now,
    });
  }

  console.log("Seed complete: 3 projects, 3 members, 5 tasks, 3 notifications, 4 users.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
