"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import { apiFetch } from "@/lib/api";

import ProjectDetails from "@/components/project-details/ProjectDetails";
import ProjectTasks from "@/components/project-details/ProjectTasks";
import AddProjectTaskModal from "@/components/project-details/AddProjectTaskModal";

import type {
  Project,
} from "@/components/project-details/types";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId =
    typeof params.projectId === "string"
      ? params.projectId
      : "";

  const [project, setProject] =
    useState<Project | null>(null);

  const [workspaceId, setWorkspaceId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    showAddTaskModal,
    setShowAddTaskModal,
  ] = useState(false);

  /*
   * =========================
   * LOAD PROJECT
   * =========================
   */

  const loadProject = useCallback(
    async () => {
      if (!projectId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        /*
         * Get the current workspace.
         */
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

        setWorkspaceId(
          currentWorkspaceId,
        );

        /*
         * Get the selected project.
         *
         * The backend returns:
         * - project details
         * - project lead
         * - project tasks
         */
        const response =
          await apiFetch(
            `/workspaces/${currentWorkspaceId}/projects/${projectId}`,
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load project",
          );
        }

        setProject(data);
      } catch (error) {
        console.error(
          "Load project error:",
          error,
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Failed to load project",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  /*
   * =========================
   * INITIAL LOAD
   * =========================
   */

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  /*
   * =========================
   * OPEN ADD TASK MODAL
   * =========================
   */

  const handleOpenAddTask = () => {
    setShowAddTaskModal(true);
  };

  /*
   * =========================
   * LOADING STATE
   * =========================
   */

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center bg-ui-bg">
          <p className="text-sm text-ui-text-muted">
            Loading project...
          </p>
        </div>
      </AppShell>
    );
  }

  /*
   * =========================
   * ERROR STATE
   * =========================
   */

  if (error || !project) {
    return (
      <AppShell>
        <main className="min-h-screen bg-ui-bg">

          <div className="flex h-20 items-center border-b border-ui-border bg-ui-surface px-7">

            <h1 className="text-xl font-semibold text-ui-text">
              Project
            </h1>

          </div>

          <div className="p-7">

            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-500">
              {error ||
                "Project not found"}
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/projects",
                )
              }
              className="mt-4 rounded-lg border border-ui-border px-4 py-2 text-sm font-bold text-ui-text-secondary transition hover:bg-ui-surface-muted"
            >
              ← Back to Projects
            </button>

          </div>

        </main>
      </AppShell>
    );
  }

  const tasks =
    project.tasks ?? [];

  return (
    <AppShell>
      <main className="min-h-screen bg-ui-bg">

        {/* =========================
            TOP BAR
            ========================= */}

        <div className="flex h-20 items-center justify-between border-b border-ui-border bg-ui-surface px-7">

          {/* PROJECT TITLE */}

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/projects",
                )
              }
              className="text-sm text-ui-text-muted transition hover:text-ui-text"
            >
              ←
            </button>

            <h1 className="text-xl font-semibold text-ui-text">
              {project.name}
            </h1>

          </div>

          {/* ADD TASK ONLY */}

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={
                handleOpenAddTask
              }
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Task
            </button>

          </div>

        </div>

        {/* =========================
            PAGE CONTENT
            ========================= */}

        <div className="bg-ui-bg p-7">

          {/* PROJECT DETAILS */}

          <ProjectDetails
            project={project}
          />

          {/* TASKS */}

          <ProjectTasks
            tasks={tasks}
            onAddTask={
              handleOpenAddTask
            }
            workspaceId={
              workspaceId
            }
            onTasksChanged={
              loadProject
            }
          />

        </div>

        {/* =========================
            ADD TASK MODAL
            ========================= */}

        <AddProjectTaskModal
          open={showAddTaskModal}
          workspaceId={
            workspaceId
          }
          projectId={
            project.id
          }
          projectName={
            project.name
          }
          onClose={() =>
            setShowAddTaskModal(false)
          }
          onTaskCreated={
            loadProject
          }
        />

      </main>
    </AppShell>
  );
}