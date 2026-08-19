"use client";

import { useState } from "react";

import type {
  ProjectTask,
} from "./types";

import { apiFetch } from "@/lib/api";

type ProjectTasksProps = {
  tasks: ProjectTask[];
  onAddTask: () => void;
  workspaceId: string;
  onTasksChanged: () => void | Promise<void>;
};

function formatPriority(
  priority: ProjectTask["priority"],
) {
  switch (priority) {
    case "URGENT":
      return "Urgent";

    case "HIGH":
      return "High";

    case "MEDIUM":
      return "Medium";

    case "LOW":
      return "Low";

    default:
      return "No Priority";
  }
}

function formatStatus(
  status: ProjectTask["status"],
) {
  switch (status) {
    case "TODO":
      return "To Do";

    case "DOING":
      return "Doing";

    case "COMPLETED":
      return "Completed";

    case "ON_HOLD":
      return "On Hold";

    default:
      return status;
  }
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export default function ProjectTasks({
  tasks,
  onAddTask,
  workspaceId,
  onTasksChanged,
}: ProjectTasksProps) {
  /*
   * =========================
   * ACTION MENU STATE
   * =========================
   */

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  /*
   * =========================
   * EDIT TASK STATE
   * =========================
   */

  const [editingTask, setEditingTask] =
    useState<ProjectTask | null>(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const [editStatus, setEditStatus] =
    useState<ProjectTask["status"]>("TODO");

  const [editPriority, setEditPriority] =
    useState<ProjectTask["priority"]>(
      "NO_PRIORITY",
    );

  const [editDueDate, setEditDueDate] =
    useState("");

  /*
   * =========================
   * DELETE TASK STATE
   * =========================
   */

  const [deletingTask, setDeletingTask] =
    useState<ProjectTask | null>(null);

  /*
   * =========================
   * COMMON STATE
   * =========================
   */

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * =========================
   * OPEN EDIT MODAL
   * =========================
   */

  const handleOpenEdit = (
    task: ProjectTask,
  ) => {
    setOpenMenuId(null);

    setEditingTask(task);

    setEditTitle(task.title);

    setEditDescription(
      task.description || "",
    );

    setEditStatus(task.status);

    setEditPriority(task.priority);

    setEditDueDate(
      task.dueDate
        ? task.dueDate.slice(0, 10)
        : "",
    );

    setError(null);
  };

  /*
   * =========================
   * CLOSE EDIT MODAL
   * =========================
   */

  const handleCloseEdit = () => {
    if (saving) {
      return;
    }

    setEditingTask(null);
    setError(null);
  };

  /*
   * =========================
   * UPDATE TASK
   * =========================
   */

  const handleUpdateTask = async () => {
    if (!editingTask) {
      return;
    }

    if (!editTitle.trim()) {
      setError(
        "Task title is required",
      );

      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${editingTask.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: editTitle.trim(),

            description:
              editDescription.trim() ||
              undefined,

            status: editStatus,

            priority: editPriority,

            dueDate:
              editDueDate || undefined,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update task",
        );
      }

      setEditingTask(null);

      await onTasksChanged();
    } catch (error) {
      console.error(
        "Update task error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update task",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================
   * OPEN DELETE CONFIRMATION
   * =========================
   */

  const handleOpenDelete = (
    task: ProjectTask,
  ) => {
    setOpenMenuId(null);

    setDeletingTask(task);

    setError(null);
  };

  /*
   * =========================
   * CLOSE DELETE CONFIRMATION
   * =========================
   */

  const handleCloseDelete = () => {
    if (saving) {
      return;
    }

    setDeletingTask(null);

    setError(null);
  };

  /*
   * =========================
   * DELETE TASK
   * =========================
   */

  const handleDeleteTask = async () => {
    if (!deletingTask) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${deletingTask.id}`,
        {
          method: "DELETE",
        },
      );

      const text =
        await response.text();

      let data: any = null;

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            text ||
            "Failed to delete task",
        );
      }

      setDeletingTask(null);

      await onTasksChanged();
    } catch (error) {
      console.error(
        "Delete task error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete task",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="mt-6">

        <div className="mb-3 flex items-center justify-between">

          <h2 className="text-sm font-bold text-ui-text">
            Tasks
          </h2>

        </div>

        <div className="w-full min-w-0 overflow-hidden rounded-lg border border-ui-border bg-ui-surface">
          <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain touch-pan-x [scrollbar-width:thin]">

          {/* HEADER */}

          <div className="grid min-w-[700px] grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] border-b border-ui-border bg-ui-surface-muted px-3 py-3 text-xs font-bold text-ui-text-secondary">

            <span>
              Task
            </span>

            <span>
              Status
            </span>

            <span>
              Priority
            </span>

            <span>
              Assignee
            </span>

            <span>
              Due Date
            </span>

            <span>
              Actions
            </span>

          </div>

          {/* TASKS */}

          {tasks.length === 0 ? (

            <div className="px-3 py-5 text-sm text-ui-text-muted">
              No tasks in this project
            </div>

          ) : (

            tasks.map((task) => (
              <div
                key={task.id}
                className="grid min-w-[700px] grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] items-center border-b border-ui-border px-3 py-4 text-xs text-ui-text-secondary"
              >

                {/* TASK */}

                <span className="font-medium text-ui-text">
                  {task.title}
                </span>

                {/* STATUS */}

                <span>
                  {formatStatus(
                    task.status,
                  )}
                </span>

                {/* PRIORITY */}

                <span>
                  {formatPriority(
                    task.priority,
                  )}
                </span>

                {/* ASSIGNEE */}

                <span>
                  -
                </span>

                {/* DUE DATE */}

                <span>
                  {formatDate(
                    task.dueDate,
                  )}
                </span>

                {/* ACTIONS */}

                <div className="relative flex min-w-0 justify-center">

                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(
                        (current) =>
                          current ===
                          task.id
                            ? null
                            : task.id,
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-md text-base font-bold text-ui-text-muted hover:bg-ui-surface-muted hover:text-ui-text"
                  >
                    ⋯
                  </button>

                  {openMenuId ===
                    task.id && (

                    <div className="absolute right-0 top-8 z-30 w-28 overflow-hidden rounded-lg border border-ui-border bg-ui-surface py-1 shadow-lg">

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenEdit(
                            task,
                          )
                        }
                        className="w-full px-3 py-2 text-left text-xs text-ui-text-secondary hover:bg-ui-surface-muted"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenDelete(
                            task,
                          )
                        }
                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>

                  )}

                </div>

              </div>
            ))

          )}

            {/* ADD TASK */}

            <button
              type="button"
              onClick={onAddTask}
              className="min-w-[700px] border-t border-ui-border px-3 py-3 text-sm font-bold text-ui-text-secondary hover:text-ui-text"
            >
              + Add Task
            </button>

          </div>

        </div>

      </section>

      {/* =========================
          EDIT TASK MODAL
      ========================= */}

      {editingTask && (

        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-4 sm:items-center sm:px-4 sm:py-6">

          <div className="my-auto flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl bg-ui-surface shadow-xl sm:max-h-[calc(100dvh-3rem)]">

            {/* HEADER */}

            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ui-border px-4 py-4 sm:px-6">

              <div>

                <h2 className="text-lg font-semibold text-ui-text">
                  Edit Task
                </h2>

                <p className="mt-1 text-xs text-ui-text-muted">
                  Update task details
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseEdit
                }
                disabled={saving}
                className="text-xl text-ui-text-muted hover:text-ui-text"
              >
                ×
              </button>

            </div>

            {/* BODY */}

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">

              {/* TITLE */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-ui-text-secondary">
                  Task Title
                </label>

                <input
                  type="text"
                  value={editTitle}
                  onChange={(event) =>
                    setEditTitle(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-ui-border bg-ui-surface px-3 py-2.5 text-sm text-ui-text outline-none focus:border-ui-text-muted"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-1.5 block text-xs font-bold text-ui-text-secondary">
                  Description
                </label>

                <textarea
                  value={
                    editDescription
                  }
                  onChange={(event) =>
                    setEditDescription(
                      event.target.value,
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-ui-border bg-ui-surface px-3 py-2.5 text-sm text-ui-text outline-none focus:border-ui-text-muted"
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
                    value={editStatus}
                    onChange={(event) =>
                      setEditStatus(
                        event.target
                          .value as ProjectTask["status"],
                      )
                    }
                    className="w-full rounded-lg border border-ui-border bg-ui-surface px-3 py-2.5 text-sm text-ui-text outline-none focus:border-ui-text-muted"
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
                    value={
                      editPriority
                    }
                    onChange={(event) =>
                      setEditPriority(
                        event.target
                          .value as ProjectTask["priority"],
                      )
                    }
                    className="w-full rounded-lg border border-ui-border bg-ui-surface px-3 py-2.5 text-sm text-ui-text outline-none focus:border-ui-text-muted"
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
                  value={editDueDate}
                  onChange={(event) =>
                    setEditDueDate(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-ui-border bg-ui-surface px-3 py-2.5 text-sm text-ui-text outline-none focus:border-ui-text-muted"
                />

              </div>

              {/* ERROR */}

              {error && (

                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                  {error}
                </div>

              )}

            </div>

            {/* FOOTER */}

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-ui-border px-4 py-4 sm:flex-row sm:justify-end sm:px-6">

              <button
                type="button"
                onClick={
                  handleCloseEdit
                }
                disabled={saving}
                className="rounded-lg border border-ui-border px-4 py-2.5 text-sm font-medium text-ui-text-secondary hover:bg-ui-surface-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleUpdateTask
                }
                disabled={saving}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================
          DELETE CONFIRMATION
      ========================= */}

      {deletingTask && (

        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-4 sm:items-center sm:px-4 sm:py-6">

          <div className="my-auto w-full max-w-md rounded-xl bg-ui-surface shadow-xl">

            {/* HEADER */}

            <div className="border-b border-ui-border px-6 py-5">

              <h2 className="text-lg font-semibold text-ui-text">
                Delete Task
              </h2>

              <p className="mt-1 text-sm text-ui-text-muted">
                Are you sure you want to delete this task?
              </p>

            </div>

            {/* BODY */}

            <div className="px-6 py-5">

              <p className="text-sm text-ui-text-secondary">

                <span className="font-bold text-ui-text">
                  {deletingTask.title}
                </span>

                {" "}will be permanently deleted.

              </p>

              {error && (

                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                  {error}
                </div>

              )}

            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-2 border-t border-ui-border px-4 py-4 sm:flex-row sm:justify-end sm:px-6">

              <button
                type="button"
                onClick={
                  handleCloseDelete
                }
                disabled={saving}
                className="rounded-lg border border-ui-border px-4 py-2.5 text-sm font-medium text-ui-text-secondary hover:bg-ui-surface-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteTask
                }
                disabled={saving}
                className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {saving
                  ? "Deleting..."
                  : "Delete Task"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}