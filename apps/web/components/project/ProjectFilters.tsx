"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

import type { ProjectPriority } from "./types";

type TaskStatus =
  | "TODO"
  | "DOING"
  | "COMPLETED"
  | "ON_HOLD";

type WorkspaceMember = {
  id?: string;
  userId?: string;
  role?: string;
  user?: {
    id: string;
    fullName?: string | null;
    username?: string | null;
    email?: string | null;
  };
};

type WorkspaceLabel = {
  id: string;
  name: string;
  color?: string;
};

export type ProjectFilterValues = {
  priority: ProjectPriority | "";
  status: TaskStatus | "";
  memberId: string;
  dueDateFrom: string;
  dueDateTo: string;
  labelId: string;
  reporterId: string;
};

type ProjectFiltersProps = {
  workspaceId: string;
  open: boolean;
  filters: ProjectFilterValues;
  onApply: (
    filters: ProjectFilterValues,
  ) => void;
  onClose: () => void;
};

type FilterMenu =
  | "status"
  | "priority"
  | "member"
  | "dueDate"
  | "teams"
  | "label"
  | "reporter"
  | null;

const emptyFilters: ProjectFilterValues = {
  priority: "",
  status: "",
  memberId: "",
  dueDateFrom: "",
  dueDateTo: "",
  labelId: "",
  reporterId: "",
};

function getMemberUserId(
  member: WorkspaceMember,
) {
  return (
    member.userId ||
    member.user?.id ||
    ""
  );
}

function getMemberName(
  member: WorkspaceMember,
) {
  return (
    member.user?.fullName ||
    member.user?.username ||
    member.user?.email ||
    "Unknown User"
  );
}

function getStatusName(
  status: string,
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
      return "Status";
  }
}

function getPriorityName(
  priority: string,
) {
  switch (priority) {
    case "NO_PRIORITY":
      return "No Priority";

    case "URGENT":
      return "Urgent";

    case "HIGH":
      return "High";

    case "MEDIUM":
      return "Medium";

    case "LOW":
      return "Low";

    default:
      return "Priority";
  }
}

export default function ProjectFilters({
  workspaceId,
  open,
  filters,
  onApply,
  onClose,
}: ProjectFiltersProps) {
  const [draftFilters, setDraftFilters] =
    useState<ProjectFilterValues>(
      filters,
    );

  const [activeMenu, setActiveMenu] =
    useState<FilterMenu>(null);

  const [
    workspaceMembers,
    setWorkspaceMembers,
  ] = useState<WorkspaceMember[]>([]);

  const [
    workspaceLabels,
    setWorkspaceLabels,
  ] = useState<WorkspaceLabel[]>([]);

  const [
    loadingMembers,
    setLoadingMembers,
  ] = useState(false);

  const [
    loadingLabels,
    setLoadingLabels,
  ] = useState(false);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  /*
   * =========================
   * LOAD MEMBERS + LABELS
   * =========================
   */

  useEffect(() => {
    if (!open || !workspaceId) {
      return;
    }

    const loadFilterData =
      async () => {
        setLoadingMembers(true);
        setLoadingLabels(true);

        try {
          const [
            membersResponse,
            labelsResponse,
          ] = await Promise.all([
            apiFetch(
              `/workspaces/${workspaceId}/members`,
            ),
            apiFetch(
              `/workspaces/${workspaceId}/labels`,
            ),
          ]);

          if (membersResponse.ok) {
            const data =
              await membersResponse.json();

            setWorkspaceMembers(
              Array.isArray(data)
                ? data
                : [],
            );
          }

          if (labelsResponse.ok) {
            const data =
              await labelsResponse.json();

            setWorkspaceLabels(
              Array.isArray(data)
                ? data
                : [],
            );
          }
        } catch (error) {
          console.error(
            "Filter loading error:",
            error,
          );
        } finally {
          setLoadingMembers(false);
          setLoadingLabels(false);
        }
      };

    loadFilterData();
  }, [open, workspaceId]);

  if (!open) {
    return null;
  }

  const updateFilter = <
    K extends keyof ProjectFilterValues,
  >(
    key: K,
    value: ProjectFilterValues[K],
  ) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleClear = () => {
    setDraftFilters(emptyFilters);
    setActiveMenu(null);

    onApply(emptyFilters);
    onClose();
  };

  const handleApply = () => {
    onApply(draftFilters);
    setActiveMenu(null);
    onClose();
  };

  /*
   * =========================
   * ARROW
   * =========================
   */

  const Arrow = () => (
    <span className="text-[12px] font-semibold text-ui-text-muted">
      ›
    </span>
  );

  /*
   * =========================
   * ICONS
   * =========================
   */

  const StatusIcon = () => (
    <span className="flex w-4 items-center justify-center text-ui-text-muted">
      ○
    </span>
  );

  const PriorityIcon = () => (
    <span className="flex w-4 items-end justify-center gap-[1px] text-ui-text-muted">
      <span className="h-1 w-[2px] rounded-sm bg-current" />
      <span className="h-2 w-[2px] rounded-sm bg-current" />
      <span className="h-3 w-[2px] rounded-sm bg-current" />
    </span>
  );

  const MemberIcon = () => (
    <span className="flex w-4 items-center justify-center text-ui-text-muted">
      ♧
    </span>
  );

  const DateIcon = () => (
    <span className="flex w-4 items-center justify-center text-ui-text-muted">
      ▣
    </span>
  );

  const TeamIcon = () => (
    <span className="flex w-4 items-center justify-center text-ui-text-muted">
      ♟
    </span>
  );

  const LabelIcon = () => (
    <span className="flex w-4 items-center justify-center text-ui-text-muted">
      ◇
    </span>
  );

  const ReporterIcon = () => (
    <span className="flex w-4 items-center justify-center text-ui-text-muted">
      ♙
    </span>
  );

  /*
   * =========================
   * MAIN FILTER MENU ROW
   * =========================
   */

  const MenuRow = ({
    label,
    icon,
    menu,
    value,
  }: {
    label: string;
    icon: React.ReactNode;
    menu: FilterMenu;
    value?: string;
  }) => (
    <button
      type="button"
      onClick={() =>
        setActiveMenu(
          activeMenu === menu
            ? null
            : menu,
        )
      }
      className="flex h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-[13px] font-semibold text-ui-text-secondary hover:bg-ui-surface-muted"
    >
      <span className="flex items-center gap-2">
        {icon}

        <span>
          {label}
        </span>
      </span>

      <span className="flex items-center gap-1">
        {value && (
          <span className="max-w-[70px] truncate text-[11px] font-medium text-ui-text-muted">
            {value}
          </span>
        )}

        <Arrow />
      </span>
    </button>
  );

  return (
    <div
      className="
        absolute
        -right-5
        top-full
        z-[9999]
        mt-2
        w-max

        sm:left-0
        sm:right-auto
      "
    >

      {/* =====================================
          MAIN FILTER MENU
      ===================================== */}

      <div className="w-[180px] max-w-[calc(100vw-1rem)] rounded-lg border border-ui-border bg-ui-surface p-1.5 shadow-lg">

        <MenuRow
          label="Status"
          icon={<StatusIcon />}
          menu="status"
          value={
            draftFilters.status
              ? getStatusName(
                  draftFilters.status,
                )
              : undefined
          }
        />

        <MenuRow
          label="Priority"
          icon={<PriorityIcon />}
          menu="priority"
          value={
            draftFilters.priority
              ? getPriorityName(
                  draftFilters.priority,
                )
              : undefined
          }
        />

        <MenuRow
          label="Members"
          icon={<MemberIcon />}
          menu="member"
        />

        <MenuRow
          label="Due Date"
          icon={<DateIcon />}
          menu="dueDate"
        />

        <MenuRow
          label="Teams"
          icon={<TeamIcon />}
          menu="teams"
        />

        <MenuRow
          label="Labels"
          icon={<LabelIcon />}
          menu="label"
        />

        <MenuRow
          label="Reporter"
          icon={<ReporterIcon />}
          menu="reporter"
        />

        <div className="my-1 border-t border-ui-border" />

        <div className="flex items-center justify-between px-1.5 py-1">

          <button
            type="button"
            onClick={handleClear}
            className="rounded-md px-2.5 py-1.5 text-[12px] font-medium text-ui-text-muted hover:bg-ui-surface-muted hover:text-ui-text"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-gray-800"
          >
            Apply
          </button>

        </div>

      </div>

      {/* =====================================
          STATUS SUBMENU
      ===================================== */}

      {activeMenu === "status" && (
        <div
          className="
            absolute
            right-[180px]
            top-1
            w-[170px]
            rounded-lg
            border
            border-ui-border
            bg-ui-surface
            p-1.5
            shadow-lg

            sm:left-[180px]
            sm:right-auto
          "
        >

          <button
            type="button"
            onClick={() =>
              updateFilter(
                "status",
                "",
              )
            }
            className={`w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium hover:bg-ui-surface-muted ${
              draftFilters.status === ""
                ? "bg-ui-surface-muted font-semibold text-ui-text"
                : "text-ui-text-secondary"
            }`}
          >
            All Statuses
          </button>

          {(
            [
              "TODO",
              "DOING",
              "COMPLETED",
              "ON_HOLD",
            ] as TaskStatus[]
          ).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() =>
                updateFilter(
                  "status",
                  status,
                )
              }
              className={`w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium hover:bg-ui-surface-muted ${
                draftFilters.status ===
                status
                  ? "bg-ui-surface-muted font-semibold text-ui-text"
                  : "text-ui-text-secondary"
              }`}
            >
              {getStatusName(
                status,
              )}
            </button>
          ))}

        </div>
      )}

      {/* =====================================
          PRIORITY SUBMENU
      ===================================== */}

      {activeMenu === "priority" && (
        <div
          className="
            absolute
            right-[180px]
            top-1
            w-[170px]
            rounded-lg
            border
            border-ui-border
            bg-ui-surface
            p-1.5
            shadow-lg

            sm:left-[180px]
            sm:right-auto
          "
        >

          <button
            type="button"
            onClick={() =>
              updateFilter(
                "priority",
                "",
              )
            }
            className={`w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium hover:bg-ui-surface-muted ${
              draftFilters.priority === ""
                ? "bg-ui-surface-muted font-semibold text-ui-text"
                : "text-ui-text-secondary"
            }`}
          >
            All Priorities
          </button>

          {[
            "NO_PRIORITY",
            "URGENT",
            "HIGH",
            "MEDIUM",
            "LOW",
          ].map((priority) => (
            <button
              key={priority}
              type="button"
              onClick={() =>
                updateFilter(
                  "priority",
                  priority as ProjectPriority,
                )
              }
              className={`w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium hover:bg-ui-surface-muted ${
                draftFilters.priority ===
                priority
                  ? "bg-ui-surface-muted font-semibold text-ui-text"
                  : "text-ui-text-secondary"
              }`}
            >
              {getPriorityName(
                priority,
              )}
            </button>
          ))}

        </div>
      )}

      {/* =====================================
          MEMBER SUBMENU
      ===================================== */}

      {activeMenu === "member" && (
        <div
          className="
            absolute
            right-[180px]
            top-[73px]
            w-[190px]
            rounded-lg
            border
            border-ui-border
            bg-ui-surface
            p-1.5
            shadow-lg

            sm:left-[180px]
            sm:right-auto
          "
        >

          <button
            type="button"
            onClick={() =>
              updateFilter(
                "memberId",
                "",
              )
            }
            className="w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-ui-text-secondary hover:bg-ui-surface-muted"
          >
            All Members
          </button>

          {loadingMembers ? (
            <div className="px-2.5 py-2 text-xs text-ui-text-muted">
              Loading...
            </div>
          ) : (
            workspaceMembers.map(
              (member) => {
                const userId =
                  getMemberUserId(
                    member,
                  );

                if (!userId) {
                  return null;
                }

                return (
                  <button
                    key={userId}
                    type="button"
                    onClick={() =>
                      updateFilter(
                        "memberId",
                        userId,
                      )
                    }
                    className={`w-full truncate rounded-md px-2.5 py-2 text-left text-[13px] font-medium hover:bg-ui-surface-muted ${
                      draftFilters.memberId ===
                      userId
                        ? "bg-ui-surface-muted font-semibold text-ui-text"
                        : "text-ui-text-secondary"
                    }`}
                  >
                    {getMemberName(
                      member,
                    )}
                  </button>
                );
              },
            )
          )}

        </div>
      )}

      {/* =====================================
          DUE DATE SUBMENU
      ===================================== */}

      {activeMenu === "dueDate" && (
        <div
          className="
            absolute
            right-[180px]
            top-[109px]
            w-[220px]
            rounded-lg
            border
            border-ui-border
            bg-ui-surface
            p-3
            shadow-lg

            sm:left-[180px]
            sm:right-auto
          "
        >

          <div className="mb-2 text-xs font-semibold text-ui-text-secondary">
            Due Date
          </div>

          <div className="space-y-2">

            <div>
              <label className="mb-1 block text-[11px] font-medium text-ui-text-muted">
                From
              </label>

              <input
                type="date"
                value={
                  draftFilters.dueDateFrom
                }
                onChange={(event) =>
                  updateFilter(
                    "dueDateFrom",
                    event.target.value,
                  )
                }
                className="h-8 w-full rounded-md border border-ui-border bg-ui-surface px-2 text-xs text-ui-text outline-none focus:border-ui-text-muted"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-ui-text-muted">
                To
              </label>

              <input
                type="date"
                value={
                  draftFilters.dueDateTo
                }
                onChange={(event) =>
                  updateFilter(
                    "dueDateTo",
                    event.target.value,
                  )
                }
                className="h-8 w-full rounded-md border border-ui-border bg-ui-surface px-2 text-xs text-ui-text outline-none focus:border-ui-text-muted"
              />
            </div>

          </div>

        </div>
      )}

      {/* =====================================
          TEAMS SUBMENU
      ===================================== */}

      {activeMenu === "teams" && (
        <div
          className="
            absolute
            right-[180px]
            top-[145px]
            w-[170px]
            rounded-lg
            border
            border-ui-border
            bg-ui-surface
            p-2
            shadow-lg

            sm:left-[180px]
            sm:right-auto
          "
        >

          <div className="px-2 py-2 text-xs font-medium text-ui-text-muted">
            No team filter configured
          </div>

        </div>
      )}

      {/* =====================================
          LABEL SUBMENU
      ===================================== */}

      {activeMenu === "label" && (
        <div
          className="
            absolute
            right-[180px]
            top-[181px]
            w-[190px]
            rounded-lg
            border
            border-ui-border
            bg-ui-surface
            p-1.5
            shadow-lg

            sm:left-[180px]
            sm:right-auto
          "
        >

          <button
            type="button"
            onClick={() =>
              updateFilter(
                "labelId",
                "",
              )
            }
            className="w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-ui-text-secondary hover:bg-ui-surface-muted"
          >
            All Labels
          </button>

          {loadingLabels ? (
            <div className="px-2.5 py-2 text-xs text-ui-text-muted">
              Loading...
            </div>
          ) : (
            workspaceLabels.map(
              (label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() =>
                    updateFilter(
                      "labelId",
                      label.id,
                    )
                  }
                  className={`w-full truncate rounded-md px-2.5 py-2 text-left text-[13px] font-medium hover:bg-ui-surface-muted ${
                    draftFilters.labelId ===
                    label.id
                      ? "bg-ui-surface-muted font-semibold text-ui-text"
                      : "text-ui-text-secondary"
                  }`}
                >
                  {label.name}
                </button>
              ),
            )
          )}

        </div>
      )}

      {/* =====================================
          REPORTER SUBMENU
      ===================================== */}

      {activeMenu === "reporter" && (
        <div
          className="
            absolute
            right-[180px]
            top-[217px]
            w-[190px]
            rounded-lg
            border
            border-ui-border
            bg-ui-surface
            p-1.5
            shadow-lg

            sm:left-[180px]
            sm:right-auto
          "
        >

          <button
            type="button"
            onClick={() =>
              updateFilter(
                "reporterId",
                "",
              )
            }
            className="w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-ui-text-secondary hover:bg-ui-surface-muted"
          >
            All Reporters
          </button>

          {loadingMembers ? (
            <div className="px-2.5 py-2 text-xs text-ui-text-muted">
              Loading...
            </div>
          ) : (
            workspaceMembers.map(
              (member) => {
                const userId =
                  getMemberUserId(
                    member,
                  );

                if (!userId) {
                  return null;
                }

                return (
                  <button
                    key={userId}
                    type="button"
                    onClick={() =>
                      updateFilter(
                        "reporterId",
                        userId,
                      )
                    }
                    className={`w-full truncate rounded-md px-2.5 py-2 text-left text-[13px] font-medium hover:bg-ui-surface-muted ${
                      draftFilters.reporterId ===
                      userId
                        ? "bg-ui-surface-muted font-semibold text-ui-text"
                        : "text-ui-text-secondary"
                    }`}
                  >
                    {getMemberName(
                      member,
                    )}
                  </button>
                );
              },
            )
          )}

        </div>
      )}

    </div>
  );
}