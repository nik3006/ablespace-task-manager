export type ProjectPriority =
  | "NO_PRIORITY"
  | "URGENT"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type Project = {
  id: string;
  name: string;
  priority: ProjectPriority;
  dueDate: string | null;

  lead?: {
    id: string;
    fullName?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;

  tasks?: {
    id: string;
  }[];
};