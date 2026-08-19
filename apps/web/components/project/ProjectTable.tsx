"use client";

import { useState } from "react";

import type {
  Project,
  ProjectPriority,
} from "./types";

export type ProjectVisibleFields = {
  projects: boolean;
  priority: boolean;
  lead: boolean;
  dueDate: boolean;
};

type ProjectTableProps = {
  projects: Project[];

  visibleFields: ProjectVisibleFields;

  onProjectClick: (
    projectId: string,
  ) => void;

  onEditProject: (
    project: Project,
  ) => void;

  onDeleteProject: (
    projectId: string,
  ) => void;

  onAddProject: () => void;
};

function formatPriority(
  priority: ProjectPriority,
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

function getLeadName(
  lead: Project["lead"],
) {
  if (!lead) {
    return "Unassigned";
  }

  return (
    lead.fullName ||
    lead.username ||
    lead.email ||
    "Unassigned"
  );
}

function getPriorityClass(
  priority: ProjectPriority,
) {
  switch (priority) {
    case "URGENT":
      return "text-orange-500";

    case "HIGH":
      return "text-red-500";

    case "MEDIUM":
      return "text-yellow-500";

    case "LOW":
      return "text-slate-400";

    default:
      return "text-slate-400";
  }
}

function PriorityIcon() {
  return (
    <span
      className="inline-flex shrink-0 items-end gap-[2px]"
      aria-hidden="true"
    >
      <span className="h-1 w-[2px] rounded-sm bg-current" />

      <span className="h-2 w-[2px] rounded-sm bg-current" />

      <span className="h-3 w-[2px] rounded-sm bg-current" />

      <span className="h-4 w-[2px] rounded-sm bg-current" />
    </span>
  );
}

export default function ProjectTable({
  projects,
  visibleFields,
  onProjectClick,
  onEditProject,
  onDeleteProject,
  onAddProject,
}: ProjectTableProps) {
  const [
    openMenuProjectId,
    setOpenMenuProjectId,
  ] = useState<string | null>(null);

  /*
   * =========================
   * COLUMN WIDTHS
   * =========================
   *
   * These are the actual grid track
   * widths.
   */

  const columnParts: string[] = [];

  let contentWidth = 0;

  if (visibleFields.projects) {
    columnParts.push("240px");
    contentWidth += 240;
  }

  if (visibleFields.priority) {
    columnParts.push("140px");
    contentWidth += 140;
  }

  if (visibleFields.lead) {
    columnParts.push("180px");
    contentWidth += 180;
  }

  if (visibleFields.dueDate) {
    columnParts.push("140px");
    contentWidth += 140;
  }

  /*
   * Actions is always visible.
   */
  columnParts.push("64px");
  contentWidth += 64;

  /*
   * The table/rows use px-4.
   *
   * px-4 = 16px left + 16px right
   *
   * Therefore the actual minimum width
   * must include those 32px.
   */
  const tableWidth =
    contentWidth + 32;

  const gridColumns =
    columnParts.join(" ");

  return (
    <div
      className="overflow-visible rounded-xl border border-ui-border bg-ui-surface"
      style={{
        width: `${tableWidth}px`,
        minWidth: `${tableWidth}px`,
      }}
    >

      {/* =========================
          HEADER
      ========================= */}

      <div
        className="grid min-h-12 items-center border-b border-ui-border bg-ui-surface-muted px-4 py-3 text-sm font-semibold text-ui-text"
        style={{
          gridTemplateColumns:
            gridColumns,
        }}
      >

        {/* PROJECTS */}

        {visibleFields.projects && (
          <span className="min-w-0 truncate pr-4">
            Projects
          </span>
        )}

        {/* PRIORITY */}

        {visibleFields.priority && (
          <span className="min-w-0 truncate pr-4">
            Priority
          </span>
        )}

        {/* LEAD */}

        {visibleFields.lead && (
          <span className="min-w-0 truncate pr-4">
            Lead
          </span>
        )}

        {/* DUE DATE */}

        {visibleFields.dueDate && (
          <span className="min-w-0 truncate pr-4">
            Due Date
          </span>
        )}

        {/* ACTIONS */}

        <span className="min-w-0 text-center">
          Actions
        </span>

      </div>

      {/* =========================
          PROJECTS
      ========================= */}

      {projects.length === 0 ? (

        <div className="px-4 py-6 text-sm text-ui-text">
          No projects
        </div>

      ) : (

        projects.map((project) => (
          <div
            key={project.id}
            className="grid min-h-14 items-center border-b border-ui-border px-4 py-3 text-sm font-semibold text-ui-text transition hover:bg-ui-surface-muted"
            style={{
              gridTemplateColumns:
                gridColumns,
            }}
            onClick={() =>
              onProjectClick(
                project.id,
              )
            }
          >

            {/* =========================
                PROJECT NAME
            ========================= */}

            {visibleFields.projects && (
              <span className="min-w-0 truncate pr-4 text-sm font-medium text-ui-text">
                {project.name}
              </span>
            )}

            {/* =========================
                PRIORITY
            ========================= */}

            {visibleFields.priority && (
              <span
                className={`flex min-w-0 items-center gap-2 pr-4 text-sm font-medium ${getPriorityClass(
                  project.priority,
                )}`}
              >

                <PriorityIcon />

                <span className="min-w-0 truncate">
                  {formatPriority(
                    project.priority,
                  )}
                </span>

              </span>
            )}

            {/* =========================
                LEAD
            ========================= */}

            {visibleFields.lead && (
              <span className="min-w-0 truncate pr-4 text-sm font-medium text-ui-text-secondary">
                {getLeadName(
                  project.lead,
                )}
              </span>
            )}

            {/* =========================
                DUE DATE
            ========================= */}

            {visibleFields.dueDate && (
              <span className="min-w-0 truncate pr-4 text-sm font-medium text-ui-text-secondary">
                {formatDate(
                  project.dueDate,
                )}
              </span>
            )}

            {/* =========================
                ACTIONS
            ========================= */}

            <div
              className="relative flex min-w-0 items-center justify-center"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                onClick={() =>
                  setOpenMenuProjectId(
                    (current) =>
                      current ===
                      project.id
                        ? null
                        : project.id,
                  )
                }
                className="rounded-md px-1.5 py-1 text-lg font-extrabold leading-none text-ui-text-secondary transition hover:bg-ui-surface-muted hover:text-ui-text"
                aria-label={`Actions for ${project.name}`}
              >
                ⋯
              </button>

              {/* =========================
                  ACTION MENU
              ========================= */}

              {openMenuProjectId ===
                project.id && (
                <div
                  className="absolute right-0 top-9 z-50 w-28 overflow-hidden rounded-lg border border-ui-border bg-ui-surface py-1 shadow-lg"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuProjectId(
                        null,
                      );

                      onEditProject(
                        project,
                      );
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-ui-text-secondary hover:bg-ui-surface-muted"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuProjectId(
                        null,
                      );

                      onDeleteProject(
                        project.id,
                      );
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>
              )}

            </div>

          </div>
        ))

      )}

      {/* =========================
          ADD PROJECT
      ========================= */}

      <button
        type="button"
        onClick={onAddProject}
        className="w-full px-4 py-4 text-left text-sm font-semibold text-ui-text-secondary transition hover:bg-ui-surface-muted hover:text-ui-text"
      >
        + Add Project
      </button>

    </div>
  );
}