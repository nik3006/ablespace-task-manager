"use client";

import type { Project } from "./types";

type ProjectDetailsProps = {
  project: Project;
};

function formatPriority(
  priority: Project["priority"],
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

function getInitial(
  value: string,
) {
  return (
    value.charAt(0).toUpperCase() ||
    "U"
  );
}

export default function ProjectDetails({
  project,
}: ProjectDetailsProps) {
  const leadName = getLeadName(
    project.lead,
  );

  return (
    <section className="w-full min-w-0 rounded-lg border border-ui-border bg-ui-surface">

      {/* HEADER */}

      <div className="border-b border-ui-border px-4 py-3 sm:px-5 sm:py-4">

        <h2 className="text-sm font-bold text-ui-text">
          Project Details
        </h2>

      </div>

      {/* DETAILS */}

      <div className="grid grid-cols-1 gap-0 p-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5 sm:p-5 lg:gap-x-10">

        {/* PRIORITY */}

        <div className="flex min-w-0 items-center justify-between gap-4 border-b border-ui-border py-3 sm:border-b-0 sm:py-0">

          <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
            Priority
          </span>

          <span className="min-w-0 truncate text-right text-xs font-bold text-ui-text-secondary">
            {formatPriority(
              project.priority,
            )}
          </span>

        </div>

        {/* LEAD */}

        <div className="flex min-w-0 items-center justify-between gap-4 border-b border-ui-border py-3 sm:border-b-0 sm:py-0">

          <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
            Lead
          </span>

          <div className="flex min-w-0 items-center gap-2">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
              {getInitial(
                leadName,
              )}
            </div>

            <span className="min-w-0 truncate text-right text-xs font-bold text-ui-text-secondary">
              {leadName}
            </span>

          </div>

        </div>

        {/* DUE DATE */}

        <div className="flex min-w-0 items-center justify-between gap-4 border-b border-ui-border py-3 sm:border-b-0 sm:py-0">

          <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
            Due Date
          </span>

          <span className="min-w-0 truncate text-right text-xs font-bold text-ui-text-secondary">
            {formatDate(
              project.dueDate,
            )}
          </span>

        </div>

        {/* MEMBERS */}

        <div className="flex min-w-0 items-center justify-between gap-4 border-b border-ui-border py-3 sm:border-b-0 sm:py-0">

          <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
            Members
          </span>

          <span className="text-xs font-bold text-ui-text-secondary">
            -
          </span>

        </div>

        {/* TEAMS */}

        <div className="flex min-w-0 items-center justify-between gap-4 border-b border-ui-border py-3 sm:border-b-0 sm:py-0">

          <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
            Teams
          </span>

          <span className="text-xs font-bold text-ui-text-secondary">
            -
          </span>

        </div>

        {/* LABELS */}

        <div className="flex min-w-0 items-center justify-between gap-4 py-3 sm:py-0">

          <span className="shrink-0 text-xs font-bold text-ui-text-secondary">
            Labels
          </span>

          <span className="text-xs font-bold text-ui-text-secondary">
            -
          </span>

        </div>

      </div>

    </section>
  );
}