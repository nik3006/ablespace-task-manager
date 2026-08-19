"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

import type {
  Project,
  ProjectPriority,
} from "./types";

type EditProjectModalProps = {
  workspaceId: string;
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onProjectUpdated: () => void | Promise<void>;
};

export default function EditProjectModal({
  workspaceId,
  project,
  open,
  onClose,
  onProjectUpdated,
}: EditProjectModalProps) {
  const [name, setName] = useState("");

  const [priority, setPriority] =
    useState<ProjectPriority>(
      "NO_PRIORITY",
    );

  const [leadId, setLeadId] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!project || !open) {
      return;
    }

    setName(project.name);

    setPriority(
      project.priority ||
        "NO_PRIORITY",
    );

    setLeadId(
      project.lead?.id || "",
    );

    setDueDate(
      project.dueDate
        ? project.dueDate.slice(
            0,
            10,
          )
        : "",
    );

    setError(null);
  }, [project, open]);

  if (!open || !project) {
    return null;
  }

  const handleUpdateProject =
    async () => {
      if (!name.trim()) {
        setError(
          "Project name is required",
        );
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const response =
          await apiFetch(
            `/workspaces/${workspaceId}/projects/${project.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name: name.trim(),
                priority,
                leadId:
                  leadId || undefined,
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
              "Failed to update project",
          );
        }

        onClose();

        await onProjectUpdated();
      } catch (error) {
        console.error(
          "Update project error:",
          error,
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Failed to update project",
          );
        }
      } finally {
        setSaving(false);
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

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ui-border px-4 py-4 sm:px-6">

          <div className="min-w-0">

            <h2 className="text-base font-semibold text-ui-text sm:text-lg">
              Edit Project
            </h2>

            <p className="mt-1 text-xs text-ui-text-muted">
              Update project details
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
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

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">

          <div className="space-y-4">

            {/* PROJECT NAME */}

            <div>

              <label className="mb-1.5 block text-xs font-bold text-ui-text-secondary">
                Project Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
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
                  placeholder:text-ui-text-muted
                  focus:border-ui-text-muted
                "
              />

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

            {/* LEAD */}

            <div>

              <label className="mb-1.5 block text-xs font-bold text-ui-text-secondary">
                Lead
              </label>

              <input
                type="text"
                value={leadId}
                onChange={(event) =>
                  setLeadId(
                    event.target.value,
                  )
                }
                placeholder="Lead ID"
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

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                {error}
              </div>
            )}

          </div>

        </div>

        {/* FOOTER */}

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
            disabled={saving}
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
              handleUpdateProject
            }
            disabled={saving}
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
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>
    </div>
  );
}