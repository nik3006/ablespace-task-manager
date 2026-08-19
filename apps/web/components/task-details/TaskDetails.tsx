"use client";

import type { Task } from "./types";

import TaskSidebar from "./TaskSidebar";
import TaskSubtasks from "./TaskSubtasks";
import TaskUpdates from "./TaskUpdates";

type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

type TaskWithLabels = Task & {
  labels?: {
    label: TaskLabel;
  }[];
};

type TaskDetailsProps = {
  task: Task;
  assignee: string;
  workspaceId: string;
  onTaskUpdated: (task: Task) => void;
  formatStatus: (
    value: Task["status"],
  ) => string;
  formatPriority: (
    value: Task["priority"],
  ) => string;
  formatDate: (
    value: string | null,
  ) => string;
};

export default function TaskDetails({
  task,
  assignee,
  workspaceId,
  onTaskUpdated,
  formatStatus,
  formatPriority,
  formatDate,
}: TaskDetailsProps) {
  /*
   * The task returned by the backend can contain
   * the labels attached to this task.
   */
  const taskWithLabels =
    task as TaskWithLabels;

  const attachedLabels =
    taskWithLabels.labels ?? [];

  return (
    <div className="flex min-w-0 flex-col gap-6 bg-ui-bg pb-24 sm:pb-24 lg:flex-row lg:pb-8">

      {/* =========================
          LEFT CONTENT
      ========================= */}

      <section className="min-w-0 flex-1">

        {/* =========================
            TITLE
        ========================= */}

        <div className="min-w-0">

          <h1 className="break-words text-2xl font-bold text-ui-text sm:text-2xl">
            {task.title}
          </h1>

          <p className="mt-2 max-w-2xl break-words text-sm leading-5 text-ui-text-muted">
            {task.description ||
              "Create clear and concise task documentation and details to guide the team effectively."}
          </p>

        </div>

        {/* =========================
            PROPERTIES
        ========================= */}

        <div className="mt-6 min-w-0">

          <h2 className="text-sm font-bold text-ui-text">
            Properties
          </h2>

          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3">

            {/* ASSIGNEE */}

            <div className="flex min-w-0 max-w-full items-center gap-2 text-sm text-ui-text-secondary">

              <span className="shrink-0 font-bold">
                Assignee
              </span>

              <span className="max-w-[calc(100vw-8rem)] truncate rounded-full bg-ui-surface-muted px-3 py-1 font-bold text-ui-text sm:max-w-none">
                {assignee}
              </span>

            </div>

            {/* DUE DATE */}

            <span className="shrink-0 rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-500">
              ▣{" "}
              {formatDate(
                task.dueDate,
              )}
            </span>

          </div>

        </div>

        {/* =========================
            LABELS
        ========================= */}

        <div className="mt-5 min-w-0">

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">

            <h2 className="shrink-0 text-sm font-bold text-ui-text">
              Labels
            </h2>

            <div className="flex min-w-0 flex-wrap gap-2">

              {attachedLabels.map(
                (taskLabel) => (
                  <span
                    key={
                      taskLabel.label.id
                    }
                    className="max-w-full rounded-full bg-ui-surface-muted px-3 py-1 text-xs font-bold text-ui-text-secondary"
                  >
                    <span className="mr-1">
                      ◇
                    </span>

                    {taskLabel.label.name}
                  </span>
                ),
              )}

            </div>

          </div>

        </div>

        {/* =========================
            RESOURCES
        ========================= */}

        <div className="mt-5">

          <h2 className="text-sm font-bold text-ui-text">
            Resources
          </h2>

          <button
            type="button"
            className="mt-2 max-w-full break-words text-left text-sm font-medium text-ui-text-muted hover:text-ui-text-secondary"
          >
            + Add document or link...
          </button>

        </div>

        {/* =========================
            SUBTASKS
        ========================= */}

        <TaskSubtasks
          workspaceId={
            workspaceId
          }
          taskId={task.id}
        />

        {/* =========================
            UPDATES
        ========================= */}

        <TaskUpdates
          assignee={assignee}
          workspaceId={
            workspaceId
          }
          taskId={task.id}
        />

      </section>

      {/* =========================
          RIGHT SIDEBAR
      ========================= */}

      <div className="min-w-0 lg:w-72 lg:shrink-0 xl:w-80">
        <TaskSidebar
          task={task}
          assignee={assignee}
          workspaceId={
            workspaceId
          }
          onTaskUpdated={
            onTaskUpdated
          }
          formatStatus={
            formatStatus
          }
          formatPriority={
            formatPriority
          }
          formatDate={
            formatDate
          }
        />
      </div>

    </div>
  );
}