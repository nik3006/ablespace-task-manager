export type ProjectPriority =
  | "NO_PRIORITY"
  | "URGENT"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type TaskStatus =
  | "TODO"
  | "DOING"
  | "COMPLETED"
  | "ON_HOLD";

export type ProjectTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: ProjectPriority;
  dueDate: string | null;
  description?: string | null;
};

export type ProjectLead = {
  id: string;
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
};

export type Project = {
  id: string;
  name: string;
  priority: ProjectPriority;
  dueDate: string | null;
  lead?: ProjectLead | null;
  tasks?: ProjectTask[];
};