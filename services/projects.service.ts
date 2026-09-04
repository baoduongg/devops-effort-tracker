import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Project, ProjectInput } from "@/types/project";

const projectsCol = collection(db, "projects");

function toProject(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    name: data.name as string,
    description: (data.description as string) ?? "",
    color: (data.color as string) ?? "#6366f1",
    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
  };
}

export async function getProjects(): Promise<Project[]> {
  const snapshot = await getDocs(projectsCol);
  return snapshot.docs.map((d) => toProject(d.id, d.data()));
}

export async function getProjectByName(name: string): Promise<Project | null> {
  const projects = await getProjects();
  const match = projects.find((p) => p.name.toLowerCase() === name.toLowerCase());
  return match ?? null;
}

export async function createProject(input: ProjectInput): Promise<string> {
  const ref = await addDoc(projectsCol, { ...input, createdAt: Timestamp.now() });
  return ref.id;
}
