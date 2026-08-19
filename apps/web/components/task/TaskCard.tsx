"use client";
import { Tag } from "lucide-react";
import type {
  Task,
  TaskVisibleFields,
} from "./TaskBoard";

type TaskCardProps = {
  task: Task;

  visibleFields: TaskVisibleFields;

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

export default function TaskCard({
  task,
  visibleFields,
  onEditTask,
  onDeleteTask,
  onOpenTask,
  openTaskMenuId,
  setOpenTaskMenuId,
}: TaskCardProps) {
  const isMenuOpen =
    task.id !== undefined &&
    openTaskMenuId === task.id;

  return (
    <article
      onClick={() => {
        if (task.id) {
          onOpenTask(task.id);
        }
      }}
      className={`relative w-full min-w-0 overflow-visible rounded-md border border-ui-border bg-ui-surface px-3 py-2.5 shadow-sm ${
        task.id
          ? "cursor-pointer transition hover:border-ui-border hover:shadow"
          : ""
      }`}
    >

      {/* TASK TITLE */}

      <div className="flex min-w-0 items-start justify-between gap-2">

        <p className="min-w-0 flex-1 break-words text-[13px] font-semibold leading-5 text-ui-text">
          {task.title}
        </p>

        {/* THREE DOTS */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            if (!task.id) {
              return;
            }

            setOpenTaskMenuId(
              isMenuOpen
                ? null
                : task.id,
            );
          }}
          disabled={!task.id}
          className="shrink-0 px-0.5 text-[10px] font-bold leading-4 text-ui-text transition hover:text-ui-text disabled:cursor-default"
        >
          •••
        </button>

      </div>

      {/* TASK MENU */}

      {isMenuOpen && (
        <div
          className="absolute right-2 top-8 z-20 w-28 overflow-hidden rounded-md border border-ui-border bg-ui-surface py-1 shadow-lg"
          onClick={(event) =>
            event.stopPropagation()
          }
        >

          <button
            type="button"
            onClick={() => {
              if (task.id) {
                setOpenTaskMenuId(null);

                onEditTask(
                  task.id,
                );
              }
            }}
            className="w-full px-3 py-1.5 text-left text-xs font-medium text-ui-text-secondary transition hover:bg-ui-surface-muted"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => {
              if (task.id) {
                setOpenTaskMenuId(null);

                onDeleteTask(
                  task.id,
                );
              }
            }}
            className="w-full px-3 py-1.5 text-left text-xs font-medium text-red-500 transition hover:bg-red-50"
          >
            Delete
          </button>

        </div>
      )}

      {/* ASSIGNEE */}

      {visibleFields.assignee && (
        <div className="mt-2.5 flex min-w-0 items-center gap-2">

          {task.assigneeAvatarUrl ? (
            <img
              src={task.assigneeAvatarUrl}
              alt={task.assignee}
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
              {task.assignee
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <span className="min-w-0 truncate text-[11px] font-bold text-ui-text">
            {task.assignee}
          </span>

        </div>
      )}

      {/* DUE DATE */}

      {visibleFields.dueDate && (
        <div className="mt-2 flex min-w-0 justify-end">

          <span className="inline-flex max-w-full shrink-0 items-center rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">

            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              className="mr-1 shrink-0"
            >
              <rect
                x="4"
                y="5"
                width="16"
                height="15"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />

              <path
                d="M8 3V7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M16 3V7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

            </svg>

            <span className="truncate">
              {task.dueDate}
            </span>

          </span>

        </div>
      )}

      {/* LABELS */}

      {visibleFields.labels &&
        task.labels.length > 0 && (
          <div className="mt-2.5 flex min-w-0 flex-wrap gap-1.5">

            {task.labels.map(
              (label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="inline-flex max-w-full items-center rounded-full bg-ui-surface-muted px-2 py-0.5 text-[10px] font-bold text-ui-text"
                >

                  <Tag
                    size={11}
                    strokeWidth={2}
                    className="mr-1 shrink-0 text-ui-text"
                  />

                  <span className="truncate">
                    {label}
                  </span>

                </span>
              ),
            )}

          </div>
        )}

    </article>
  );
}