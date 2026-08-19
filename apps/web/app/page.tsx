import AppShell from "@/components/layout/AppShell";
import TaskBoard from "@/components/task/TaskBoard";

export default function HomePage() {
  return (
    <AppShell>
      <TaskBoard />
    </AppShell>
  );
}