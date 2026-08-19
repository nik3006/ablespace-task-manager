"use client";

import TaskCard from "./TaskCard";
import type {
  Task,
  TaskVisibleFields,
} from "./TaskBoard";

type TaskColumnProps = {
  title: string;
  tasks: Task[];

  visibleFields: TaskVisibleFields;

  onAddTask: (
    status: string,
  ) => void;

  onEditTask: (
    taskId: string,
  ) => void;

  onDeleteTask: (
    taskId: string,
  ) => void;

  onOpenTask: (
    taskId: string,
  ) => void;

  openTaskMenuId: string | null;

  setOpenTaskMenuId: (
    taskId: string | null,
  ) => void;
};

export default function TaskColumn({
  title,
  tasks,
  visibleFields,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onOpenTask,
  openTaskMenuId,
  setOpenTaskMenuId,
}: TaskColumnProps) {
  const statusMap: Record<
    string,
    string
  > = {
    "To Do": "TODO",
    Doing: "DOING",
    Completed: "COMPLETED",
    "On Hold": "ON_HOLD",
  };

  return (
    <section className="h-fit self-start w-[280px] min-w-[280px] shrink-0 rounded-lg border border-ui-border bg-ui-surface-muted">

      {/* COLUMN HEADER */}

      <div className="flex h-11 items-center justify-between px-3">

        <div className="flex min-w-0 items-center gap-2">

          <span className="shrink-0 text-xs font-bold text-ui-text">
            ⠿
          </span>

          <h2 className="truncate text-[13px] font-semibold text-ui-text">
            {title}
          </h2>

        </div>

        <div className="flex shrink-0 items-center gap-2">

          {/* ADD */}

          <button
            type="button"
            onClick={() =>
              onAddTask(
                statusMap[title],
              )
            }
            className="text-base font-medium leading-none text-ui-text transition hover:text-ui-text"
          >
            +
          </button>

          {/* COLUMN MENU */}

          <button
            type="button"
            className="text-[11px] font-bold leading-none text-ui-text transition hover:text-ui-text"
          >
            •••
          </button>

        </div>

      </div>

      {/* TASKS */}

      <div className="space-y-2 px-1.5 pb-2">

        {tasks.map((task) => (
          <TaskCard
            key={
              task.id ??
              task.title
            }
            task={task}
            visibleFields={
              visibleFields
            }
            onEditTask={
              onEditTask
            }
            onDeleteTask={
              onDeleteTask
            }
            onOpenTask={
              onOpenTask
            }
            openTaskMenuId={
              openTaskMenuId
            }
            setOpenTaskMenuId={
              setOpenTaskMenuId
            }
          />
        ))}

        {/* ADD TASK */}

        <button
          type="button"
          onClick={() =>
            onAddTask(
              statusMap[title],
            )
          }
          className="w-full rounded-md px-2.5 py-2 text-left text-[12px] font-semibold text-ui-text transition hover:bg-ui-bg"
        >
          + Add Task
        </button>

      </div>

    </section>
  );
}