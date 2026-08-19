"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

import ProjectTable, {
  type ProjectVisibleFields,
} from "./ProjectTable";

import AddProjectModal from "./AddProjectModal";

import EditProjectModal from "./EditProjectModal";

import ProjectFilters, {
  type ProjectFilterValues,
} from "./ProjectFilters";

import type {
  Project,
} from "./types";

const emptyFilters: ProjectFilterValues = {
  priority: "",
  status: "",
  memberId: "",
  dueDateFrom: "",
  dueDateTo: "",
  labelId: "",
  reporterId: "",
};

const defaultVisibleFields: ProjectVisibleFields = {
  projects: true,
  priority: true,
  lead: true,
  dueDate: true,
};

export default function ProjectBoard() {
  const router = useRouter();

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [workspaceId, setWorkspaceId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [showAddProject, setShowAddProject] =
    useState(false);

  const [showEditProject, setShowEditProject] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const [showDeleteProject, setShowDeleteProject] =
    useState(false);

  const [deletingProject, setDeletingProject] =
    useState<Project | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [showFilters, setShowFilters] =
    useState(false);

  const [showFields, setShowFields] =
    useState(false);

  const [visibleFields, setVisibleFields] =
    useState<ProjectVisibleFields>(
      defaultVisibleFields,
    );

  const [filters, setFilters] =
    useState<ProjectFilterValues>(
      emptyFilters,
    );

  /*
   * =========================
   * LOAD PROJECTS
   * =========================
   */

  const loadProjects = useCallback(
    async (
      appliedFilters: ProjectFilterValues =
        filters,
    ) => {
      try {
        setLoading(true);
        setError(null);

        const workspaceResponse =
          await apiFetch(
            "/workspaces",
          );

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

        const currentWorkspace =
          workspaces[0];

        setWorkspaceId(
          currentWorkspace.id,
        );

        /*
         * Build query parameters.
         */

        const queryParams =
          new URLSearchParams();

        if (appliedFilters.priority) {
          queryParams.set(
            "priority",
            appliedFilters.priority,
          );
        }

        if (appliedFilters.status) {
          queryParams.set(
            "status",
            appliedFilters.status,
          );
        }

        if (appliedFilters.memberId) {
          queryParams.set(
            "memberId",
            appliedFilters.memberId,
          );
        }

        if (
          appliedFilters.dueDateFrom
        ) {
          queryParams.set(
            "dueDateFrom",
            appliedFilters.dueDateFrom,
          );
        }

        if (
          appliedFilters.dueDateTo
        ) {
          queryParams.set(
            "dueDateTo",
            appliedFilters.dueDateTo,
          );
        }

        if (appliedFilters.labelId) {
          queryParams.set(
            "labelId",
            appliedFilters.labelId,
          );
        }

        if (
          appliedFilters.reporterId
        ) {
          queryParams.set(
            "reporterId",
            appliedFilters.reporterId,
          );
        }

        const queryString =
          queryParams.toString();

        const response =
          await apiFetch(
            `/workspaces/${currentWorkspace.id}/projects${
              queryString
                ? `?${queryString}`
                : ""
            }`,
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load projects",
          );
        }

        setProjects(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (error) {
        console.error(
          "Load projects error:",
          error,
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Failed to load projects",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  /*
   * =========================
   * INITIAL LOAD
   * =========================
   */

  useEffect(() => {
    loadProjects(emptyFilters);
  }, [loadProjects]);

  /*
   * =========================
   * APPLY FILTERS
   * =========================
   */

  const handleApplyFilters = (
    newFilters: ProjectFilterValues,
  ) => {
    setFilters(newFilters);
    loadProjects(newFilters);
  };

  /*
   * =========================
   * CLEAR FILTERS
   * =========================
   */

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    loadProjects(emptyFilters);
    setShowFilters(false);
  };

  /*
   * =========================
   * OPEN PROJECT
   * =========================
   */

  const handleProjectClick = (
    projectId: string,
  ) => {
    router.push(
      `/projects/${projectId}`,
    );
  };

  /*
   * =========================
   * EDIT PROJECT
   * =========================
   */

  const handleEditProject = (
    project: Project,
  ) => {
    setEditingProject(project);
    setShowEditProject(true);
  };

  /*
   * =========================
   * OPEN DELETE CONFIRMATION
   * =========================
   */

  const handleDeleteProject = (
    projectId: string,
  ) => {
    const project =
      projects.find(
        (item) =>
          item.id === projectId,
      );

    if (!project) {
      return;
    }

    setDeletingProject(project);
    setShowDeleteProject(true);
  };

  /*
   * =========================
   * CANCEL DELETE
   * =========================
   */

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setShowDeleteProject(false);
    setDeletingProject(null);
  };

  /*
   * =========================
   * CONFIRM DELETE
   * =========================
   */

  const handleConfirmDelete =
    async () => {
      if (
        !deletingProject ||
        !workspaceId
      ) {
        return;
      }

      try {
        setDeleting(true);
        setError(null);

        const response =
          await apiFetch(
            `/workspaces/${workspaceId}/projects/${deletingProject.id}`,
            {
              method: "DELETE",
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to delete project",
          );
        }

        setShowDeleteProject(false);
        setDeletingProject(null);

        await loadProjects(
          filters,
        );
      } catch (error) {
        console.error(
          "Delete project error:",
          error,
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Failed to delete project",
          );
        }
      } finally {
        setDeleting(false);
      }
    };

  /*
   * =========================
   * TOGGLE FIELD
   * =========================
   */

  const handleToggleField = (
    field: keyof ProjectVisibleFields,
  ) => {
    setVisibleFields(
      (current) => ({
        ...current,
        [field]:
          !current[field],
      }),
    );
  };

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <main className="min-h-screen min-w-0 bg-ui-bg pb-20 lg:pb-0">

      {/* =========================
          TOP BAR
      ========================= */}

      <div className="border-b border-ui-border bg-ui-surface">

        <div className="flex min-h-20 min-w-0 flex-col gap-4 px-4 py-4 sm:px-5 md:px-7 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0">

          {/* TITLE */}

          <h1 className="shrink-0 text-xl font-semibold text-ui-text">
            Projects
          </h1>

          {/* CONTROLS */}

          <div className="flex min-w-0 flex-wrap items-center gap-2">

            {/* =========================
                FIELDS
            ========================= */}

            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  setShowFields(
                    (current) =>
                      !current,
                  );

                  setShowFilters(false);
                }}
                className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold text-ui-text transition ${
                  showFields
                    ? "border-ui-text-muted bg-ui-surface-muted"
                    : "border-ui-border hover:bg-ui-surface-muted"
                }`}
              >
                ▥ Fields
              </button>

              {showFields && (
                <div className="absolute left-0 top-full z-40 mt-2 w-40 max-w-[calc(100vw-2rem)] rounded-lg border border-ui-border bg-ui-surface py-1 shadow-lg sm:left-auto sm:right-0">

                  {/* PROJECTS */}

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleField(
                        "projects",
                      )
                    }
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs font-semibold text-ui-text-secondary hover:bg-ui-surface-muted"
                  >
                    <span className="w-4 text-center text-ui-text">
                      {visibleFields.projects
                        ? "✓"
                        : ""}
                    </span>

                    <span>
                      Projects
                    </span>
                  </button>

                  {/* PRIORITY */}

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleField(
                        "priority",
                      )
                    }
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs font-semibold text-ui-text-secondary hover:bg-ui-surface-muted"
                  >
                    <span className="w-4 text-center text-ui-text">
                      {visibleFields.priority
                        ? "✓"
                        : ""}
                    </span>

                    <span>
                      Priority
                    </span>
                  </button>

                  {/* LEAD */}

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleField(
                        "lead",
                      )
                    }
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs font-semibold text-ui-text-secondary hover:bg-ui-surface-muted"
                  >
                    <span className="w-4 text-center text-ui-text">
                      {visibleFields.lead
                        ? "✓"
                        : ""}
                    </span>

                    <span>
                      Lead
                    </span>
                  </button>

                  {/* DUE DATE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleField(
                        "dueDate",
                      )
                    }
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs font-semibold text-ui-text-secondary hover:bg-ui-surface-muted"
                  >
                    <span className="w-4 text-center text-ui-text">
                      {visibleFields.dueDate
                        ? "✓"
                        : ""}
                    </span>

                    <span>
                      Due Date
                    </span>
                  </button>

                </div>
              )}

            </div>

            {/* =========================
                FILTER
            ========================= */}

            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  setShowFilters(
                    (current) =>
                      !current,
                  );

                  setShowFields(false);
                }}
                aria-label="Filter projects"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
                  showFilters
                    ? "border-ui-text-muted bg-ui-surface-muted"
                    : "border-ui-border hover:bg-ui-surface-muted"
                }`}
              >

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-ui-text-secondary"
                >
                  <path
                    d="M4 5H20L14 12V18L10 20V12L4 5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </button>

              <ProjectFilters
                workspaceId={
                  workspaceId ?? ""
                }
                open={showFilters}
                filters={filters}
                onApply={
                  handleApplyFilters
                }
                onClose={() =>
                  setShowFilters(false)
                }
              />

            </div>

            {/* =========================
                ADD PROJECT
            ========================= */}

            <button
              type="button"
              onClick={() =>
                setShowAddProject(true)
              }
              className="whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Project
            </button>

          </div>

        </div>

      </div>

      {/* =========================
          CONTENT
      ========================= */}

      <div className="min-w-0 bg-ui-bg px-3 py-4 sm:px-5 sm:py-5 md:px-7 md:py-7">

        {loading && (
          <div className="rounded-lg border border-ui-border bg-ui-surface px-4 py-6 text-sm text-ui-text-muted">
            Loading projects...
          </div>
        )}

        {!loading && error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && (
          <>

            {/* =========================
                PROJECT TABLE
            ========================= */}

            <div className="min-w-0 overflow-x-auto overscroll-x-contain touch-pan-x [scrollbar-width:thin]">

              {/*
               * IMPORTANT:
               *
               * There is intentionally NO
               * min-w-[680px] wrapper here.
               *
               * ProjectTable itself owns its
               * required minimum width.
               *
               * This is the ONLY horizontal
               * scroll container.
               */}

              <ProjectTable
                projects={projects}
                visibleFields={
                  visibleFields
                }
                onProjectClick={
                  handleProjectClick
                }
                onEditProject={
                  handleEditProject
                }
                onDeleteProject={
                  handleDeleteProject
                }
                onAddProject={() =>
                  setShowAddProject(
                    true,
                  )
                }
              />

            </div>

            {/* =========================
                ACTIVE FILTER INDICATOR
            ========================= */}

            {Object.values(filters).some(
              (value) => value !== "",
            ) && (
              <div className="mt-3 flex min-w-0 flex-col gap-2 rounded-lg border border-ui-border bg-ui-surface-muted px-3 py-2 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-xs text-ui-text-secondary">
                  Filters applied
                </span>

                <button
                  type="button"
                  onClick={
                    handleClearFilters
                  }
                  className="self-start text-xs font-bold text-ui-text-secondary hover:text-ui-text sm:self-auto"
                >
                  Clear filters
                </button>

              </div>
            )}

          </>
        )}

      </div>

      {/* =========================
          ADD PROJECT MODAL
      ========================= */}

      {workspaceId && (
        <AddProjectModal
          workspaceId={workspaceId}
          open={showAddProject}
          onClose={() =>
            setShowAddProject(false)
          }
          onProjectCreated={() =>
            loadProjects(
              filters,
            )
          }
        />
      )}

      {/* =========================
          EDIT PROJECT MODAL
      ========================= */}

      {workspaceId && (
        <EditProjectModal
          workspaceId={workspaceId}
          project={editingProject}
          open={showEditProject}
          onClose={() => {
            setShowEditProject(
              false,
            );

            setEditingProject(
              null,
            );
          }}
          onProjectUpdated={() =>
            loadProjects(
              filters,
            )
          }
        />
      )}

      {/* =========================
          DELETE PROJECT MODAL
      ========================= */}

      {showDeleteProject &&
        deletingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6 sm:px-6">

            <div className="my-auto w-full max-w-md overflow-hidden rounded-xl bg-ui-surface shadow-xl">

              {/* HEADER */}

              <div className="border-b border-ui-border px-4 py-4 sm:px-6 sm:py-5">

                <h2 className="text-lg font-semibold text-ui-text">
                  Delete Project
                </h2>

                <p className="mt-1 text-sm text-ui-text-muted">
                  Are you sure you want to delete this project?
                </p>

              </div>

              {/* BODY */}

              <div className="px-4 py-4 sm:px-6 sm:py-5">

                <p className="break-words text-sm text-ui-text-secondary">

                  <span className="font-bold text-ui-text">
                    {deletingProject.name}
                  </span>

                  {" "}
                  will be permanently deleted.

                </p>

              </div>

              {/* FOOTER */}

              <div className="flex flex-col-reverse gap-2 border-t border-ui-border px-4 py-4 sm:flex-row sm:justify-end sm:px-6">

                <button
                  type="button"
                  onClick={
                    handleCancelDelete
                  }
                  disabled={deleting}
                  className="w-full rounded-lg border border-ui-border px-4 py-2.5 text-sm font-medium text-ui-text-secondary transition hover:bg-ui-surface-muted disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleConfirmDelete
                  }
                  disabled={deleting}
                  className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete Project"}
                </button>

              </div>

            </div>

          </div>
        )}

    </main>
  );
}