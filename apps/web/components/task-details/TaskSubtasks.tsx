"use client";

import {
  useEffect,
  useState,
} from "react";

import { apiFetch } from "@/lib/api";

type SubtaskPriority =
  | "NO_PRIORITY"
  | "URGENT"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

type Subtask = {
  id: string;
  title: string;
  completed: boolean;
  priority: SubtaskPriority;
  taskId: string;
  createdAt: string;
  updatedAt: string;
};

type TaskSubtasksProps = {
  workspaceId: string;
  taskId: string;
};

export default function TaskSubtasks({
  workspaceId,
  taskId,
}: TaskSubtasksProps) {
  const [subtasks, setSubtasks] =
    useState<Subtask[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [adding, setAdding] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [newTitle, setNewTitle] =
    useState("");

  const [newPriority, setNewPriority] =
    useState<SubtaskPriority>(
      "NO_PRIORITY",
    );

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [priorityOpenId, setPriorityOpenId] =
    useState<string | null>(null);

  /* =========================
     LOAD SUBTASKS
  ========================= */

  const loadSubtasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${taskId}/subtasks`,
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
            "Failed to load subtasks",
        );
      }

      setSubtasks(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (error) {
      console.error(
        "Load subtasks error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load subtasks",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId && taskId) {
      loadSubtasks();
    }
  }, [workspaceId, taskId]);

  /* =========================
     ADD SUBTASK
  ========================= */

  const handleAddSubtask = async () => {
    const title = newTitle.trim();

    if (!title || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${taskId}/subtasks`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            priority: newPriority,
          }),
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
            "Failed to create subtask",
        );
      }

      if (!data) {
        throw new Error(
          "Subtask was created but the server returned no data.",
        );
      }

      setSubtasks((current) => [
        ...current,
        data,
      ]);

      setNewTitle("");
      setNewPriority("NO_PRIORITY");
      setAdding(false);
    } catch (error) {
      console.error(
        "Add subtask error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create subtask",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     TOGGLE COMPLETED
  ========================= */

  const handleToggleCompleted = async (
    subtask: Subtask,
  ) => {
    if (updatingId) {
      return;
    }

    setUpdatingId(subtask.id);
    setError(null);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${taskId}/subtasks/${subtask.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            completed:
              !subtask.completed,
          }),
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
            "Failed to update subtask",
        );
      }

      setSubtasks((current) =>
        current.map((item) =>
          item.id === subtask.id
            ? data
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Toggle subtask error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update subtask",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================
     CHANGE PRIORITY
  ========================= */

  const handlePriorityChange = async (
    subtask: Subtask,
    priority: SubtaskPriority,
  ) => {
    if (
      updatingId ||
      priority === subtask.priority
    ) {
      setPriorityOpenId(null);
      return;
    }

    setUpdatingId(subtask.id);
    setError(null);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${taskId}/subtasks/${subtask.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            priority,
          }),
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
            "Failed to update priority",
        );
      }

      setSubtasks((current) =>
        current.map((item) =>
          item.id === subtask.id
            ? data
            : item,
        ),
      );

      setPriorityOpenId(null);
    } catch (error) {
      console.error(
        "Update subtask priority error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update priority",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================
     DELETE SUBTASK
  ========================= */

  const handleDeleteSubtask = async (
    subtaskId: string,
  ) => {
    if (updatingId) {
      return;
    }

    setUpdatingId(subtaskId);
    setError(null);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${taskId}/subtasks/${subtaskId}`,
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
            "Failed to delete subtask",
        );
      }

      setSubtasks((current) =>
        current.filter(
          (item) =>
            item.id !== subtaskId,
        ),
      );
    } catch (error) {
      console.error(
        "Delete subtask error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete subtask",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================
     FORMAT PRIORITY
  ========================= */

  const formatPriority = (
    priority: SubtaskPriority,
  ) => {
    const priorityMap: Record<
      SubtaskPriority,
      string
    > = {
      NO_PRIORITY: "No Priority",
      URGENT: "Urgent",
      HIGH: "High",
      MEDIUM: "Medium",
      LOW: "Low",
    };

    return priorityMap[priority];
  };

  return (
    <div className="mt-6 min-w-0">

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex min-w-0 items-center gap-2">

        <span className="shrink-0 text-ui-text">
          ▾
        </span>

        <h2 className="text-sm font-bold text-ui-text">
          Subtasks
        </h2>

      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="mt-3 min-w-0 overflow-hidden rounded-lg border border-ui-border">

        {/* 
          ONLY THE TABLE SCROLLS.

          The add-subtask form is intentionally
          OUTSIDE this scroll container.
        */}

        <div className="w-full overflow-x-auto overscroll-x-contain touch-pan-x [scrollbar-width:thin]">

          <div className="min-w-[700px]">

            {/* =========================
                TABLE HEADER
            ========================= */}

            <div className="grid grid-cols-[minmax(220px,1.5fr)_140px_120px_120px_70px] border-b border-ui-border bg-ui-surface-muted px-3 py-3 text-xs font-bold text-ui-text-secondary">

              <span>
                Task
              </span>

              <span>
                Priority
              </span>

              <span>
                Members
              </span>

              <span>
                Due Date
              </span>

              <span>
                Actions
              </span>

            </div>

            {/* =========================
                LOADING
            ========================= */}

            {loading && (
              <div className="border-b border-ui-border px-3 py-4 text-xs font-bold text-ui-text-muted">
                Loading subtasks...
              </div>
            )}

            {/* =========================
                ERROR
            ========================= */}

            {!loading && error && (
              <div className="border-b border-ui-border bg-red-50 px-3 py-3 text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            {/* =========================
                EMPTY
            ========================= */}

            {!loading &&
              !error &&
              subtasks.length === 0 && (
                <div className="grid grid-cols-[minmax(220px,1.5fr)_140px_120px_120px_70px] border-b border-ui-border px-3 py-3 text-xs text-ui-text-secondary">

                  <span>
                    No subtasks
                  </span>

                  <span>-</span>

                  <span>-</span>

                  <span>-</span>

                  <span>-</span>

                </div>
              )}

            {/* =========================
                SUBTASK ROWS
            ========================= */}

            {!loading &&
              subtasks.map(
                (subtask) => (
                  <div
                    key={subtask.id}
                    className="grid grid-cols-[minmax(220px,1.5fr)_140px_120px_120px_70px] items-center border-b border-ui-border px-3 py-3 text-xs text-ui-text-secondary"
                  >

                    {/* TASK */}

                    <div className="flex min-w-0 items-center gap-2 pr-3">

                      <input
                        type="checkbox"
                        checked={
                          subtask.completed
                        }
                        disabled={
                          updatingId ===
                          subtask.id
                        }
                        onChange={() =>
                          handleToggleCompleted(
                            subtask,
                          )
                        }
                        className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-gray-900"
                      />

                      <span
                        className={
                          subtask.completed
                            ? "min-w-0 truncate text-ui-text-muted line-through"
                            : "min-w-0 truncate text-ui-text-secondary"
                        }
                      >
                        {subtask.title}
                      </span>

                    </div>

                    {/* PRIORITY */}

                    <div className="relative min-w-0 pr-3">

                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          subtask.id
                        }
                        onClick={() =>
                          setPriorityOpenId(
                            (current) =>
                              current ===
                              subtask.id
                                ? null
                                : subtask.id,
                          )
                        }
                        className="max-w-full truncate font-bold text-ui-text-secondary transition hover:text-ui-text disabled:opacity-50"
                      >
                        {formatPriority(
                          subtask.priority,
                        )}
                      </button>

                      {priorityOpenId ===
                        subtask.id && (
                        <div className="absolute left-0 top-6 z-30 w-32 overflow-hidden rounded-lg border border-ui-border bg-ui-surface py-1 shadow-lg">

                          {(
                            [
                              "NO_PRIORITY",
                              "URGENT",
                              "HIGH",
                              "MEDIUM",
                              "LOW",
                            ] as SubtaskPriority[]
                          ).map(
                            (
                              priority,
                            ) => (
                              <button
                                key={
                                  priority
                                }
                                type="button"
                                onClick={() =>
                                  handlePriorityChange(
                                    subtask,
                                    priority,
                                  )
                                }
                                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[11px] font-bold text-ui-text-secondary hover:bg-ui-surface-muted"
                              >

                                <span className="truncate">
                                  {formatPriority(
                                    priority,
                                  )}
                                </span>

                                {subtask.priority ===
                                  priority && (
                                  <span className="shrink-0 text-ui-text">
                                    ✓
                                  </span>
                                )}

                              </button>
                            ),
                          )}

                        </div>
                      )}

                    </div>

                    {/* MEMBERS */}

                    <span className="min-w-0 truncate pr-3">
                      -
                    </span>

                    {/* DUE DATE */}

                    <span className="min-w-0 truncate pr-3">
                      -
                    </span>

                    {/* ACTIONS */}

                    <div className="relative flex items-center">

                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          subtask.id
                        }
                        onClick={() =>
                          handleDeleteSubtask(
                            subtask.id,
                          )
                        }
                        className="whitespace-nowrap font-bold text-ui-text-secondary hover:text-red-600 disabled:opacity-50"
                      >
                        ...
                      </button>

                    </div>

                  </div>
                ),
              )}

          </div>

        </div>

        {/* =========================
            ADD SUBTASK FORM
        ========================= */}

        {adding ? (
          <div className="w-full border-b border-ui-border bg-ui-surface px-3 py-3 sm:px-4">

            <div className="flex w-full min-w-0 flex-col gap-2">

              {/* INPUT */}

              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(event) =>
                  setNewTitle(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    handleAddSubtask();
                  }

                  if (
                    event.key ===
                    "Escape"
                  ) {
                    setAdding(false);
                    setNewTitle("");
                    setNewPriority(
                      "NO_PRIORITY",
                    );
                    setError(null);
                  }
                }}
                placeholder="Subtask name..."
                className="box-border w-full min-w-0 rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-xs text-ui-text outline-none focus:border-ui-text-muted"
              />

              {/* CONTROLS */}

              <div className="flex w-full min-w-0 flex-wrap items-center gap-2">

                <select
                  value={newPriority}
                  onChange={(event) =>
                    setNewPriority(
                      event.target
                        .value as SubtaskPriority,
                    )
                  }
                  className="min-w-0 flex-1 rounded-md border border-ui-border bg-ui-surface px-2 py-2 text-xs font-bold text-ui-text-secondary outline-none sm:flex-none"
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

                <button
                  type="button"
                  onClick={
                    handleAddSubtask
                  }
                  disabled={
                    !newTitle.trim() ||
                    submitting
                  }
                  className="shrink-0 rounded-md bg-gray-900 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Adding..."
                    : "Add"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setNewTitle("");
                    setNewPriority(
                      "NO_PRIORITY",
                    );
                    setError(null);
                  }}
                  className="shrink-0 px-2 py-2 text-xs font-bold text-ui-text-muted hover:text-ui-text"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setError(null);
            }}
            className="w-full px-3 py-3 text-left text-sm font-bold text-ui-text-secondary hover:text-ui-text"
          >
            + Add Subtasks
          </button>
        )}

      </div>

    </div>
  );
}