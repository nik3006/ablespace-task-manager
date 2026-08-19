export type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;

  status:
    | "TODO"
    | "DOING"
    | "COMPLETED"
    | "ON_HOLD";

  priority:
    | "NO_PRIORITY"
    | "URGENT"
    | "HIGH"
    | "MEDIUM"
    | "LOW";

  dueDate: string | null;

  reporter?: {
    name: string | null;
    email: string;
  } | null;

  labels?: {
    label: TaskLabel;
  }[];
};