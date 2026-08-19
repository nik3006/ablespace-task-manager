"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";

import TaskDetails from "@/components/task-details/TaskDetails";
import type { Task } from "@/components/task-details/types";

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(
    null,
  );

  const [workspaceId, setWorkspaceId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTask = async () => {
      try {
        const workspaceResponse =
          await apiFetch("/workspaces");

        if (!workspaceResponse.ok) {
          throw new Error(
            "Failed to load workspace",
          );
        }

        const workspaces =
          await workspaceResponse.json();

        if (
          !Array.isArray(workspaces) ||
          workspaces.length === 0
        ) {
          throw new Error(
            "No workspace found",
          );
        }

        const currentWorkspaceId =
          workspaces[0].id;

        if (!cancelled) {
          setWorkspaceId(
            currentWorkspaceId,
          );
        }

        const response = await apiFetch(
          `/workspaces/${currentWorkspaceId}/tasks/${taskId}`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load task",
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setTask(data);
        }
      } catch (err) {
        console.error(
          "Load task error:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load task",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (taskId) {
      loadTask();
    }

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const formatStatus = (
    value: Task["status"],
  ) => {
    const statusMap = {
      TODO: "To Do",
      DOING: "Doing",
      COMPLETED: "Completed",
      ON_HOLD: "On Hold",
    };

    return statusMap[value];
  };

  const formatPriority = (
    value: Task["priority"],
  ) => {
    const priorityMap = {
      NO_PRIORITY: "No Priority",
      URGENT: "Urgent",
      HIGH: "High",
      MEDIUM: "Medium",
      LOW: "Low",
    };

    return priorityMap[value];
  };

  const formatDate = (
    value: string | null,
  ) => {
    if (!value) {
      return "No due date";
    }

    return new Date(
      value,
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-ui-bg">

        <Sidebar />

        <main className="flex flex-1 items-center justify-center bg-ui-bg">

          <p className="text-sm font-bold text-ui-text-muted">
            Loading task...
          </p>

        </main>

      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex min-h-screen bg-ui-bg">

        <Sidebar />

        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-ui-bg">

          <p className="text-sm font-bold text-red-600">
            {error || "Task not found"}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white"
          >
            Go Back
          </button>

        </main>

      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex min-h-screen bg-ui-bg">

        <Sidebar />

        <main className="flex flex-1 items-center justify-center bg-ui-bg">

          <p className="text-sm font-bold text-ui-text-muted">
            Loading workspace...
          </p>

        </main>

      </div>
    );
  }

  const assignee =
    task.reporter?.name ||
    task.reporter?.email ||
    "Unassigned";

  return (
    <div className="flex min-h-screen bg-ui-bg">

      <Sidebar />

      <main className="flex-1 overflow-x-auto bg-ui-bg">

        {/* Top bar */}
        <div className="flex h-14 items-center border-b border-ui-border bg-ui-surface px-5">

          <button
            type="button"
            onClick={() => router.back()}
            className="text-lg font-bold text-ui-text-secondary hover:text-ui-text"
          >
            ←
          </button>

        </div>

        {/* Main content */}
        <div className="bg-ui-bg p-7">

          <TaskDetails
            task={task}
            assignee={assignee}
            workspaceId={workspaceId}
            onTaskUpdated={setTask}
            formatStatus={formatStatus}
            formatPriority={formatPriority}
            formatDate={formatDate}
          />

        </div>

      </main>

    </div>
  );
}