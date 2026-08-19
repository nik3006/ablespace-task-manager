"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";

import type {
  ProjectPriority,
  TaskStatus,
} from "./types";

type AddProjectTaskModalProps = {
  open: boolean;
  workspaceId: string;
  projectId: string;
  projectName: string;
  onClose: () => void;
  onTaskCreated: () => void | Promise<void>;
};

export default function AddProjectTaskModal({
  open,
  workspaceId,
  projectId,
  projectName,
  onClose,
  onTaskCreated,
}: AddProjectTaskModalProps) {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<TaskStatus>("TODO");

  const [priority, setPriority] =
    useState<ProjectPriority>(
      "NO_PRIORITY",
    );

  const [dueDate, setDueDate] =
    useState("");

  const [creatingTask, setCreatingTask] =
    useState(false);

  const [taskError, setTaskError] =
    useState<string | null>(null);

  if (!open) {
    return null;
  }

  const handleCreateTask = async () => {
    if (!title.trim()) {
      setTaskError(
        "Task title is required",
      );
      return;
    }

    if (!workspaceId) {
      setTaskError(
        "Workspace ID is missing",
      );
      return;
    }

    if (!projectId) {
      setTaskError(
        "Project ID is missing",
      );
      return;
    }

    setCreatingTask(true);
    setTaskError(null);

    try {
      const response =
        await apiFetch(
          `/workspaces/${workspaceId}/tasks`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title: title.trim(),
              description:
                description.trim() ||
                undefined,
              status,
              priority,
              projectId,
              dueDate:
                dueDate || undefined,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create task",
        );
      }

      console.log(
        "Task created:",
        data,
      );

      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("NO_PRIORITY");
      setDueDate("");
      setTaskError(null);

      onClose();

      await onTaskCreated();
    } catch (error) {
      console.error(
        "Create task error:",
        error,
      );

      if (error instanceof Error) {
        setTaskError(
          error.message,
        );
      } else {
        setTaskError(
          "Failed to create task",
        );
      }
    } finally {
      setCreatingTask(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-start
        justify-center
        overflow-y-auto
        bg-black/40
        px-3
        py-4
        sm:items-center
        sm:px-4
        sm:py-6
      "
    >
      <div
        className="
          my-auto
          flex
          w-full
          max-w-lg
          max-h-[calc(100dvh-2rem)]
          flex-col
          overflow-hidden
          rounded-xl
          bg-ui-surface
          shadow-xl
          sm:max-h-[calc(100dvh-3rem)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* MODAL HEADER */}

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ui-border px-4 py-4 sm:px-6">

          <div className="min-w-0">

            <h2 className="text-base font-semibold text-ui-text sm:text-lg">
              Add Task
            </h2>

            <p className="mt-1 truncate text-xs text-ui-text-muted">
              Add a task to {projectName}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creatingTask}
            aria-label="Close"
            className="
              shrink-0
              p-1
              text-xl
              leading-none
              text-ui-text-muted
              transition
              hover:text-ui-text
              disabled:opacity-50
            "
          >
            ×
          </button>

        </div>

        {/* MODAL BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">

          <div className="space-y-4">

            {/* TITLE */}

            <div>

              <label className="mb-1.5 block text-xs font-bold text-ui-text-secondary">
                Task Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                placeholder="Enter task title"
                className="
                  w-full
                  rounded-lg
                  border
                  border-ui-border
                  bg-ui-surface
                  px-3
                  py-2.5
                  text-sm
                  text-ui-text
                  outline-none
                  placeholder:text-ui-text-muted
                  focus:border-ui-text-muted
                "
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="mb-1.5 block text-xs font-bold text-ui-text-secondary">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Enter task description"
                rows={3}
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-ui-border
                  bg-ui-surface
                  px-3
                  py-2.5
                  text-sm
                  text-ui-text
                  outline-none
                  placeholder:text-ui-text-muted
                  focus:border-ui-text-muted
                "
              />

            </div>

            {/* STATUS + PRIORITY */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* STATUS */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-ui-text-secondary">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as TaskStatus,
                    )
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-ui-border
                    bg-ui-surface
                    px-3
                    py-2.5
                    text-sm
                    text-ui-text
                    outline-none
                    focus:border-ui-text-muted
                  "
                >

                  <option value="TODO">
                    To Do
                  </option>

                  <option value="DOING">
                    Doing
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                  <option value="ON_HOLD">
                    On Hold
                  </option>

                </select>

              </div>

              {/* PRIORITY */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-ui-text-secondary">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as ProjectPriority,
                    )
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-ui-border
                    bg-ui-surface
                    px-3
                    py-2.5
                    text-sm
                    text-ui-text
                    outline-none
                    focus:border-ui-text-muted
                  "
                >

                  <option value="NO_PRIORITY">
                    No Priority
                  </option>

                  <option value="URGENT">
                    Urgent
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="LOW">
                    Low
                  </option>

                </select>

              </div>

            </div>

            {/* DUE DATE */}

            <div>

              <label className="mb-1.5 block text-xs font-bold text-ui-text-secondary">
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value,
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-ui-border
                  bg-ui-surface
                  px-3
                  py-2.5
                  text-sm
                  text-ui-text
                  outline-none
                  focus:border-ui-text-muted
                "
              />

            </div>

            {/* ERROR */}

            {taskError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                {taskError}
              </div>
            )}

          </div>

        </div>

        {/* MODAL FOOTER */}

        <div
          className="
            flex
            shrink-0
            flex-col-reverse
            gap-2
            border-t
            border-ui-border
            px-4
            py-4
            sm:flex-row
            sm:justify-end
            sm:px-6
          "
        >

          <button
            type="button"
            onClick={onClose}
            disabled={creatingTask}
            className="
              w-full
              rounded-lg
              border
              border-ui-border
              px-4
              py-2.5
              text-sm
              font-medium
              text-ui-text-secondary
              transition
              hover:bg-ui-surface-muted
              disabled:opacity-50
              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleCreateTask
            }
            disabled={creatingTask}
            className="
              w-full
              rounded-lg
              bg-gray-900
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            {creatingTask
              ? "Creating..."
              : "Create Task"}
          </button>

        </div>

      </div>
    </div>
  );
}