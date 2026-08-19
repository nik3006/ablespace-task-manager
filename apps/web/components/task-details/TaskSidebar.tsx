"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

import type { Task } from "./types";

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

type User = {
  id: string;
  name: string | null;
  email: string | null;
};

type WorkspaceMember = {
  id: string;
  userId: string;
  role: "OWNER" | "MEMBER" | "GUEST";
  user: User | null;
};

type TaskMember = {
  id: string;
  taskId: string;
  userId: string;
  user: User | null;
};

type TaskSidebarProps = {
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

export default function TaskSidebar({
  task,
  assignee,
  workspaceId,
  onTaskUpdated,
  formatStatus,
  formatPriority,
  formatDate,
}: TaskSidebarProps) {
  /* =========================
     UPDATES
  ========================= */

  type TaskUpdate = {
    id: string;
    content: string;
    createdAt: string;
    author?: {
      id: string;
      fullName: string;
      email?: string | null;
      username?: string | null;
    } | null;
  };

  const [latestUpdate, setLatestUpdate] =
    useState<TaskUpdate | null>(null);

  const loadLatestUpdate = async () => {
    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${task.id}/updates`,
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (
        Array.isArray(data) &&
        data.length > 0
      ) {
        setLatestUpdate(
          data[data.length - 1],
        );
      } else {
        setLatestUpdate(null);
      }
    } catch (error) {
      console.error(
        "Load latest update error:",
        error,
      );
    }
  };

  useEffect(() => {
    loadLatestUpdate();

    const interval = setInterval(() => {
      loadLatestUpdate();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [workspaceId, task.id]);

  /* =========================
     PRIORITY
  ========================= */

  const [priorityOpen, setPriorityOpen] =
    useState(false);

  const [
    updatingPriority,
    setUpdatingPriority,
  ] = useState(false);

  /* =========================
     STATUS
  ========================= */

  const [statusOpen, setStatusOpen] =
    useState(false);

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  /* =========================
     MEMBERS
  ========================= */

  const [membersOpen, setMembersOpen] =
    useState(false);

  const [
    workspaceMembers,
    setWorkspaceMembers,
  ] = useState<WorkspaceMember[]>([]);

  const [taskMembers, setTaskMembers] =
    useState<TaskMember[]>([]);

  const [
    loadingMembers,
    setLoadingMembers,
  ] = useState(false);

  const [
    updatingMemberId,
    setUpdatingMemberId,
  ] = useState<string | null>(null);

  /* =========================
     DUE DATE
  ========================= */

  const [
    updatingDueDate,
    setUpdatingDueDate,
  ] = useState(false);

  /* =========================
     LABELS
  ========================= */

  const [labelsOpen, setLabelsOpen] =
    useState(false);

  const [
    workspaceLabels,
    setWorkspaceLabels,
  ] = useState<TaskLabel[]>([]);

  const [
    loadingLabels,
    setLoadingLabels,
  ] = useState(false);

  const [
    updatingLabelId,
    setUpdatingLabelId,
  ] = useState<string | null>(null);

  /* =========================
     TASK WITH LABELS
  ========================= */

  const taskWithLabels =
    task as TaskWithLabels;

  /* =========================
     UPDATE PRIORITY
  ========================= */

  const handlePriorityChange = async (
    newPriority: Task["priority"],
  ) => {
    if (
      updatingPriority ||
      newPriority === task.priority
    ) {
      setPriorityOpen(false);
      return;
    }

    setUpdatingPriority(true);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            priority: newPriority,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update priority",
        );
      }

      onTaskUpdated(data);

      setPriorityOpen(false);
    } catch (error) {
      console.error(
        "Update priority error:",
        error,
      );
    } finally {
      setUpdatingPriority(false);
    }
  };

  /* =========================
     UPDATE STATUS
  ========================= */

  const handleStatusChange = async (
    newStatus: Task["status"],
  ) => {
    if (
      updatingStatus ||
      newStatus === task.status
    ) {
      setStatusOpen(false);
      return;
    }

    setUpdatingStatus(true);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update status",
        );
      }

      onTaskUpdated(data);

      setStatusOpen(false);
    } catch (error) {
      console.error(
        "Update status error:",
        error,
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =========================
     LOAD MEMBERS
  ========================= */

  const loadMembers = async () => {
    setLoadingMembers(true);

    try {
      const workspaceResponse =
        await apiFetch(
          `/workspaces/${workspaceId}/members`,
        );

      const taskResponse =
        await apiFetch(
          `/workspaces/${workspaceId}/tasks/${task.id}/members`,
        );

      if (!workspaceResponse.ok) {
        throw new Error(
          "Failed to load workspace members",
        );
      }

      if (!taskResponse.ok) {
        throw new Error(
          "Failed to load task members",
        );
      }

      const workspaceData =
        await workspaceResponse.json();

      const taskData =
        await taskResponse.json();

      setWorkspaceMembers(
        Array.isArray(workspaceData)
          ? workspaceData
          : [],
      );

      setTaskMembers(
        Array.isArray(taskData)
          ? taskData
          : [],
      );
    } catch (error) {
      console.error(
        "Load members error:",
        error,
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  /* =========================
     OPEN MEMBERS
  ========================= */

  const handleOpenMembers = async () => {
    const nextState = !membersOpen;

    setMembersOpen(nextState);

    if (nextState) {
      await loadMembers();
    }
  };

  /* =========================
     CHECK MEMBER
  ========================= */

  const isTaskMember = (
    userId: string,
  ) => {
    return taskMembers.some(
      (taskMember) =>
        taskMember.userId === userId,
    );
  };

  /* =========================
     ADD / REMOVE TASK MEMBER
  ========================= */

  const handleMemberChange = async (
    member: WorkspaceMember,
  ) => {
    const userId = member.userId;

    if (
      updatingMemberId ||
      !userId
    ) {
      return;
    }

    setUpdatingMemberId(userId);

    const alreadyAssigned =
      isTaskMember(userId);

    try {
      let response: Response;

      if (alreadyAssigned) {
        response = await apiFetch(
          `/workspaces/${workspaceId}/tasks/${task.id}/members/${userId}`,
          {
            method: "DELETE",
          },
        );
      } else {
        response = await apiFetch(
          `/workspaces/${workspaceId}/tasks/${task.id}/members`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              userId,
            }),
          },
        );
      }

      const contentType =
        response.headers.get(
          "content-type",
        );

      const data =
        contentType?.includes(
          "application/json",
        )
          ? await response.json()
          : null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update task member",
        );
      }

      await loadMembers();
    } catch (error) {
      console.error(
        "Update member error:",
        error,
      );
    } finally {
      setUpdatingMemberId(null);
    }
  };

  /* =========================
     UPDATE DUE DATE
  ========================= */

  const handleDueDateChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newDueDate =
      event.target.value;

    setUpdatingDueDate(true);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            dueDate: newDueDate
              ? newDueDate
              : null,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update due date",
        );
      }

      onTaskUpdated(data);
    } catch (error) {
      console.error(
        "Update due date error:",
        error,
      );
    } finally {
      setUpdatingDueDate(false);
    }
  };

  /* =========================
     LOAD LABELS
  ========================= */

  const loadLabels = async () => {
    setLoadingLabels(true);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/labels`,
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load labels",
        );
      }

      const data =
        await response.json();

      setWorkspaceLabels(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (error) {
      console.error(
        "Load labels error:",
        error,
      );
    } finally {
      setLoadingLabels(false);
    }
  };

  /* =========================
     OPEN LABELS
  ========================= */

  const handleOpenLabels = async () => {
    const nextState = !labelsOpen;

    setLabelsOpen(nextState);

    if (nextState) {
      await loadLabels();
    }
  };

  /* =========================
     CHECK LABEL
  ========================= */

  const isLabelAttached = (
    labelId: string,
  ) => {
    return (
      taskWithLabels.labels?.some(
        (taskLabel) =>
          taskLabel.label.id ===
          labelId,
      ) ?? false
    );
  };

  /* =========================
     ADD / REMOVE LABEL
  ========================= */

  const handleLabelChange = async (
    label: TaskLabel,
  ) => {
    if (updatingLabelId) {
      return;
    }

    setUpdatingLabelId(label.id);

    const attached =
      isLabelAttached(label.id);

    try {
      let response: Response;

      if (attached) {
        response = await apiFetch(
          `/workspaces/${workspaceId}/tasks/${task.id}/labels/${label.id}`,
          {
            method: "DELETE",
          },
        );
      } else {
        response = await apiFetch(
          `/workspaces/${workspaceId}/tasks/${task.id}/labels/${label.id}`,
          {
            method: "POST",
          },
        );
      }

      const contentType =
        response.headers.get(
          "content-type",
        );

      const data =
        contentType?.includes(
          "application/json",
        )
          ? await response.json()
          : null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update label",
        );
      }

      /*
       * Reload the task so the latest
       * labels are available.
       */
      const taskResponse =
        await apiFetch(
          `/workspaces/${workspaceId}/tasks/${task.id}`,
        );

      if (!taskResponse.ok) {
        throw new Error(
          "Failed to refresh task",
        );
      }

      const updatedTask =
        await taskResponse.json();

      onTaskUpdated(updatedTask);

      /*
       * Reload workspace labels in case
       * anything changed.
       */
      await loadLabels();
    } catch (error) {
      console.error(
        "Update label error:",
        error,
      );
    } finally {
      setUpdatingLabelId(null);
    }
  };

  /* =========================
     DATE INPUT VALUE
  ========================= */

  const dateInputValue = task.dueDate
    ? new Date(task.dueDate)
        .toISOString()
        .split("T")[0]
    : "";

  /* =========================
     CURRENT TASK MEMBER
  ========================= */

  const currentTaskMember =
    taskMembers.length > 0 &&
    taskMembers[0].user
      ? taskMembers[0].user
      : null;

  const currentMemberInitial =
    currentTaskMember?.name
      ?.charAt(0)
      ?.toUpperCase() ??
    currentTaskMember?.email
      ?.charAt(0)
      ?.toUpperCase() ??
    assignee?.charAt(0)
      ?.toUpperCase() ??
    "U";

  /* =========================
     ASSIGNABLE MEMBERS
  ========================= */

  const assignableMembers =
    workspaceMembers.filter(
      (member) =>
        member.role === "OWNER" ||
        member.role === "MEMBER",
    );

  /* =========================
     CURRENT LABEL COUNT
  ========================= */

  const currentLabelCount =
    taskWithLabels.labels?.length ?? 0;

  return (
    <aside className="w-full min-w-0 lg:w-72 lg:shrink-0">

      {/* =========================
          DETAILS
      ========================= */}

      <div className="min-w-0 rounded-lg border border-ui-border bg-ui-surface">

        <div className="flex items-center justify-between border-b border-ui-border px-4 py-3">

          <h2 className="text-sm font-bold text-ui-text">
            Details
          </h2>

          <div className="flex gap-3 text-ui-text-secondary">
            <button
              type="button"
              className="font-bold"
            >
              +
            </button>

            <button
              type="button"
              className="font-bold"
            >
              ⚙
            </button>
          </div>

        </div>

        <div className="space-y-5 p-4">

          {/* STATUS */}

          <div className="relative flex min-w-0 items-center justify-between gap-4">

            <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
              Status
            </span>

            <button
              type="button"
              disabled={updatingStatus}
              onClick={() =>
                setStatusOpen(
                  (current) =>
                    !current,
                )
              }
              className="max-w-[65%] truncate text-right text-xs font-bold text-orange-500 transition hover:opacity-70 disabled:opacity-50"
            >
              ●{" "}
              {formatStatus(
                task.status,
              )}
            </button>

            {statusOpen && (
              <div className="absolute right-0 top-7 z-30 w-40 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-ui-border bg-ui-surface py-1 shadow-lg">

                {(
                  [
                    "TODO",
                    "DOING",
                    "COMPLETED",
                    "ON_HOLD",
                  ] as Task["status"][]
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        status,
                      )
                    }
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-bold text-ui-text-secondary transition hover:bg-ui-surface-muted"
                  >
                    <span className="truncate">
                      {formatStatus(
                        status,
                      )}
                    </span>

                    {task.status ===
                      status && (
                      <span className="shrink-0 text-ui-text">
                        ✓
                      </span>
                    )}
                  </button>
                ))}

              </div>
            )}

          </div>

          {/* PRIORITY */}

          <div className="relative flex min-w-0 items-center justify-between gap-4">

            <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
              Priority
            </span>

            <button
              type="button"
              disabled={updatingPriority}
              onClick={() =>
                setPriorityOpen(
                  (current) =>
                    !current,
                )
              }
              className="max-w-[65%] truncate text-right text-xs font-bold text-red-500 transition hover:opacity-70 disabled:opacity-50"
            >
              {formatPriority(
                task.priority,
              )}
            </button>

            {priorityOpen && (
              <div className="absolute right-0 top-7 z-30 w-40 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-ui-border bg-ui-surface py-1 shadow-lg">

                {(
                  [
                    "NO_PRIORITY",
                    "URGENT",
                    "HIGH",
                    "MEDIUM",
                    "LOW",
                  ] as Task["priority"][]
                ).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() =>
                      handlePriorityChange(
                        priority,
                      )
                    }
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-bold text-ui-text-secondary transition hover:bg-ui-surface-muted"
                  >
                    <span className="truncate">
                      {formatPriority(
                        priority,
                      )}
                    </span>

                    {task.priority ===
                      priority && (
                      <span className="shrink-0 text-ui-text">
                        ✓
                      </span>
                    )}
                  </button>
                ))}

              </div>
            )}

          </div>

          {/* MEMBERS */}

          <div className="relative flex min-w-0 items-center justify-between gap-4">

            <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
              Members
            </span>

            <button
              type="button"
              onClick={handleOpenMembers}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white"
            >
              {currentMemberInitial}
            </button>

            {membersOpen && (
              <div className="absolute right-0 top-8 z-30 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-ui-border bg-ui-surface py-1 shadow-lg">

                {loadingMembers ? (
                  <div className="px-3 py-3 text-xs font-bold text-ui-text-muted">
                    Loading members...
                  </div>
                ) : assignableMembers.length ===
                  0 ? (
                  <div className="px-3 py-3 text-xs font-bold text-ui-text-muted">
                    No assignable members found
                  </div>
                ) : (
                  assignableMembers.map(
                    (member) => {
                      const assigned =
                        isTaskMember(
                          member.userId,
                        );

                      const displayName =
                        member.user?.name ??
                        member.user?.email ??
                        "Unknown User";

                      const memberInitial =
                        displayName
                          .charAt(0)
                          .toUpperCase();

                      return (
                        <button
                          key={member.id}
                          type="button"
                          disabled={
                            updatingMemberId ===
                            member.userId
                          }
                          onClick={() =>
                            handleMemberChange(
                              member,
                            )
                          }
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition hover:bg-ui-surface-muted disabled:opacity-50"
                        >
                          <div className="flex min-w-0 items-center gap-2">

                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                              {memberInitial}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-ui-text-secondary">
                                {displayName}
                              </p>

                              <p className="truncate text-[10px] text-ui-text-muted">
                                {member.role}
                              </p>
                            </div>

                          </div>

                          {assigned && (
                            <span className="shrink-0 text-xs font-bold text-ui-text">
                              ✓
                            </span>
                          )}

                        </button>
                      );
                    },
                  )
                )}

              </div>
            )}

          </div>

          {/* DATES */}

          <div className="relative flex min-w-0 items-center justify-between gap-4">

            <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
              Dates
            </span>

            <div className="relative min-w-0">
              <button
                type="button"
                disabled={
                  updatingDueDate
                }
                className="max-w-[150px] truncate text-right text-xs font-bold text-ui-text-secondary disabled:opacity-50"
              >
                {formatDate(
                  task.dueDate,
                )}
              </button>

              <input
                type="date"
                value={dateInputValue}
                onChange={
                  handleDueDateChange
                }
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                disabled={
                  updatingDueDate
                }
              />
            </div>

          </div>

          {/* LABELS */}

          <div className="relative flex min-w-0 items-center justify-between gap-4">

            <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
              Labels
            </span>

            <button
              type="button"
              onClick={handleOpenLabels}
              className="max-w-[65%] truncate text-right text-xs font-bold text-ui-text-secondary transition hover:text-ui-text"
            >
              {currentLabelCount} labels
            </button>

            {labelsOpen && (
              <div className="absolute right-0 top-7 z-30 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-ui-border bg-ui-surface py-1 shadow-lg">

                {loadingLabels ? (
                  <div className="px-3 py-3 text-xs font-bold text-ui-text-muted">
                    Loading labels...
                  </div>
                ) : workspaceLabels.length ===
                  0 ? (
                  <div className="px-3 py-3 text-xs font-bold text-ui-text-muted">
                    No labels found
                  </div>
                ) : (
                  workspaceLabels.map(
                    (label) => {
                      const attached =
                        isLabelAttached(
                          label.id,
                        );

                      return (
                        <button
                          key={label.id}
                          type="button"
                          disabled={
                            updatingLabelId ===
                            label.id
                          }
                          onClick={() =>
                            handleLabelChange(
                              label,
                            )
                          }
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition hover:bg-ui-surface-muted disabled:opacity-50"
                        >
                          <div className="flex min-w-0 items-center gap-2">

                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  label.color,
                              }}
                            />

                            <span className="truncate text-xs font-bold text-ui-text-secondary">
                              {label.name}
                            </span>

                          </div>

                          {attached && (
                            <span className="shrink-0 text-xs font-bold text-ui-text">
                              ✓
                            </span>
                          )}

                        </button>
                      );
                    },
                  )
                )}

              </div>
            )}

          </div>

          {/* TEAMS */}

          <div className="flex min-w-0 items-center justify-between gap-4">
            <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
              Teams
            </span>

            <span className="text-xs font-bold text-ui-text-secondary">
              -
            </span>
          </div>

          {/* REPORTER */}

          <div className="flex min-w-0 items-center justify-between gap-4">

            <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
              Reporter
            </span>

            <span className="max-w-[150px] truncate text-right text-xs font-bold text-ui-text-secondary">
              {assignee ||
                "Unassigned"}
            </span>

          </div>

        </div>

      </div>

      {/* =========================
          UPDATES
      ========================= */}

      <div className="mt-4 min-w-0 rounded-lg border border-ui-border bg-ui-surface">

        <div className="border-b border-ui-border px-4 py-3">

          <h2 className="text-sm font-bold text-ui-text">
            Updates
          </h2>

        </div>

        <div className="p-4">

          <div className="flex min-w-0 gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
              {(
                latestUpdate?.author?.fullName ||
                latestUpdate?.author?.username ||
                latestUpdate?.author?.email ||
                assignee ||
                "U"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-xs font-bold text-ui-text">
                {latestUpdate?.author?.fullName ||
                  latestUpdate?.author?.username ||
                  latestUpdate?.author?.email ||
                  assignee ||
                  "Unassigned"}
              </p>

              <p className="mt-1 break-words text-xs text-ui-text-muted">
                {latestUpdate?.content ||
                  "Task details viewed"}
              </p>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}