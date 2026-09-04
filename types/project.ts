export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export type ProjectInput = Omit<Project, "id" | "createdAt">;
