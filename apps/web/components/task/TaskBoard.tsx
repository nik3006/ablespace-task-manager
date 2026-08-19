"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

import TaskColumn from "./TaskColumn";
import TaskListView from "./TaskListView";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import DeleteTaskModal from "./DeleteTaskModal";

export type Task = {
  id?: string;
  title: string;
  assignee: string;
  assigneeAvatarUrl?: string | null;
  dueDate: string;
  labels: string[];
  priority?:
    | "NO_PRIORITY"
    | "URGENT"
    | "HIGH"
    | "MEDIUM"
    | "LOW";
};

export type DatabaseTask = {
  id: string;
  title: string;
  description: string | null;

  status:
    | "TODO"
    | "DOING"
    | "COMPLETED"
    | "ON_HOLD";

  priority:
    | "NO_PRIORITY"
    | "URGENT"
    | "HIGH"
    | "MEDIUM"
    | "LOW";

  dueDate: string | null;

  labels?: {
    label: {
      id: string;
      name: string;
    };
  }[]; 

  reporter?: {
    id?: string;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  } | null;
};

export type Column = {
  title: string;
  tasks: Task[];
};

export type TaskVisibleFields = {
  priority: boolean;
  assignee: boolean;
  dueDate: boolean;
  labels: boolean;
};

const columns: Column[] = [
  {
    title: "To Do",
    tasks: [
      {
        title: "Write API Documentation",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: [
          "Deployment",
          "Deployment",
        ],
        priority: "HIGH",
      },
      {
        title: "Implement Search Function",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: [
          "Deployment",
          "Deployment",
        ],
        priority: "HIGH",
      },
      {
        title: "Deploy to Production",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: [
          "Deployment",
          "Deployment",
        ],
        priority: "URGENT",
      },
    ],
  },

  {
    title: "Doing",
    tasks: [
      {
        title: "Code Review Completed",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: [
          "Deployment",
          "Deployment",
        ],
        priority: "MEDIUM",
      },
      {
        title: "Design Mockups Finalized",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: [
          "Deployment",
          "Deployment",
        ],
        priority: "MEDIUM",
      },
    ],
  },

  {
    title: "Completed",
    tasks: [
      {
        title: "Feature Testing Passed",
        assignee: "QA Team",
        dueDate: "30 Jul",
        labels: [
          "Testing",
          "Passed",
        ],
        priority: "HIGH",
      },
      {
        title: "UI Design Updated",
        assignee: "Designer",
        dueDate: "31 Jul",
        labels: [
          "Design",
          "Updated",
        ],
        priority: "MEDIUM",
      },
      {
        title: "Security Audit Scheduled",
        assignee: "Security",
        dueDate: "01 Aug",
        labels: [
          "Audit",
          "Scheduled",
        ],
        priority: "URGENT",
      },
    ],
  },

  {
    title: "On Hold",
    tasks: [
      {
        title: "UI Review",
        assignee: "Designer",
        dueDate: "01 Aug",
        labels: [
          "Design",
          "Review",
        ],
        priority: "LOW",
      },
      {
        title: "Backend Integration",
        assignee: "Dev Team",
        dueDate: "02 Aug",
        labels: [
          "Development",
        ],
        priority: "MEDIUM",
      },
      {
        title: "User Feedback",
        assignee: "Product",
        dueDate: "03 Aug",
        labels: [
          "Research",
        ],
        priority: "LOW",
      },
      {
        title: "Performance Testing",
        assignee: "Engineering",
        dueDate: "04 Aug",
        labels: [
          "Optimization",
        ],
        priority: "LOW",
      },
    ],
  },
];

type TaskView = "board" | "list";

type FilterState = {
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  label: string;
};

export default function TaskBoard() {
  const router = useRouter();

  /* =========================
     VIEW STATE
  ========================= */

  const [taskView, setTaskView] =
    useState<TaskView>("board");

  const [showViewMenu, setShowViewMenu] =
    useState(false);

  /* =========================
     SEARCH
  ========================= */

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  /* =========================
     FIELDS
  ========================= */

  const [showFieldsMenu, setShowFieldsMenu] =
    useState(false);

  const [visibleFields, setVisibleFields] =
    useState<TaskVisibleFields>({
      priority: true,
      assignee: true,
      dueDate: true,
      labels: true,
    });

  /* =========================
     FILTER
  ========================= */

  const [showFilterMenu, setShowFilterMenu] =
    useState(false);

  const [filters, setFilters] =
    useState<FilterState>({
      status: "",
      priority: "",
      assignee: "",
      dueDate: "",
      label: "",
    });

  /* =========================
     ADD TASK STATE
  ========================= */

  const [showAddTaskModal, setShowAddTaskModal] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState("TODO");

  const [priority, setPriority] =
    useState("NO_PRIORITY");

  const [dueDate, setDueDate] =
    useState("");

  const [creatingTask, setCreatingTask] =
    useState(false);

  /* =========================
     EDIT TASK STATE
  ========================= */

  const [showEditTaskModal, setShowEditTaskModal] =
    useState(false);

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);

  const [editingTask, setEditingTask] =
    useState<DatabaseTask | null>(null);

  const [updatingTask, setUpdatingTask] =
    useState(false);

  /* =========================
     DELETE TASK STATE
  ========================= */

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [deletingTaskId, setDeletingTaskId] =
    useState<string | null>(null);

  const [deletingTask, setDeletingTask] =
    useState(false);

  /* =========================
     TASK MENU STATE
  ========================= */

  const [openTaskMenuId, setOpenTaskMenuId] =
    useState<string | null>(null);

  /* =========================
     ERROR STATE
  ========================= */

  const [taskError, setTaskError] =
    useState<string | null>(null);

  /* =========================
     DATABASE TASKS
  ========================= */

  const [databaseTasks, setDatabaseTasks] =
    useState<DatabaseTask[]>([]);

  /* =========================
     LOAD TASKS
  ========================= */

  const loadDatabaseTasks =
    useCallback(async () => {
      try {
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

        const workspaceId =
          workspaces[0].id;

        const response =
          await apiFetch(
            `/workspaces/${workspaceId}/tasks`,
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load tasks",
          );
        }

        const data =
          await response.json();

        setDatabaseTasks(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (error) {
        console.error(
          "Load tasks error:",
          error,
        );
      }
    }, []);

  useEffect(() => {
    loadDatabaseTasks();
  }, [loadDatabaseTasks]);

  /* =========================
     CREATE TASK
  ========================= */

  const handleCreateTask =
    async () => {
      if (!title.trim()) {
        return;
      }

      setCreatingTask(true);
      setTaskError(null);

      try {
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

        const workspaceId =
          workspaces[0].id;

        const response =
          await apiFetch(
            `/workspaces/${workspaceId}/tasks`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                title:
                  title.trim(),
                description:
                  description.trim() ||
                  undefined,
                status,
                priority,
                dueDate:
                  dueDate ||
                  undefined,
              }),
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to create task",
          );
        }

        await loadDatabaseTasks();

        setShowAddTaskModal(false);

        setTitle("");
        setDescription("");
        setStatus("TODO");
        setPriority("NO_PRIORITY");
        setDueDate("");
      } catch (error) {
        console.error(
          "Create task error:",
          error,
        );

        if (error instanceof Error) {
          setTaskError(
            error.message,
          );
        } else {
          setTaskError(
            "Failed to create task",
          );
        }
      } finally {
        setCreatingTask(false);
      }
    };

  /* =========================
     OPEN EDIT
  ========================= */

  const handleOpenEditTask = (
    taskId: string,
  ) => {
    const task =
      databaseTasks.find(
        (item) =>
          item.id === taskId,
      );

    if (!task) {
      return;
    }

    setOpenTaskMenuId(null);
    setEditingTaskId(task.id);
    setEditingTask(task);
    setTaskError(null);
    setShowEditTaskModal(true);
  };

  /* =========================
     UPDATE TASK
  ========================= */

  const handleUpdateTask =
    async () => {
      if (
        !editingTaskId ||
        !editingTask
      ) {
        return;
      }

      if (
        !editingTask.title.trim()
      ) {
        setTaskError(
          "Task title is required",
        );
        return;
      }

      setUpdatingTask(true);
      setTaskError(null);

      try {
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

        const workspaceId =
          workspaces[0].id;

        const response =
          await apiFetch(
            `/workspaces/${workspaceId}/tasks/${editingTaskId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                title:
                  editingTask.title.trim(),
                description:
                  editingTask.description?.trim() ||
                  undefined,
                status:
                  editingTask.status,
                priority:
                  editingTask.priority,
                dueDate:
                  editingTask.dueDate ||
                  undefined,
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

        await loadDatabaseTasks();

        setShowEditTaskModal(false);
        setEditingTask(null);
        setEditingTaskId(null);
      } catch (error) {
        console.error(
          "Update task error:",
          error,
        );

        if (error instanceof Error) {
          setTaskError(
            error.message,
          );
        } else {
          setTaskError(
            "Failed to update task",
          );
        }
      } finally {
        setUpdatingTask(false);
      }
    };

  /* =========================
     DELETE
  ========================= */

  const handleOpenDeleteConfirm = (
    taskId: string,
  ) => {
    setOpenTaskMenuId(null);
    setDeletingTaskId(taskId);
    setTaskError(null);
    setShowDeleteConfirm(true);
  };

  const handleDeleteTask =
    async () => {
      if (!deletingTaskId) {
        return;
      }

      setDeletingTask(true);
      setTaskError(null);

      try {
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

        const workspaceId =
          workspaces[0].id;

        const response =
          await apiFetch(
            `/workspaces/${workspaceId}/tasks/${deletingTaskId}`,
            {
              method: "DELETE",
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to delete task",
          );
        }

        await loadDatabaseTasks();

        setShowDeleteConfirm(false);
        setDeletingTaskId(null);
      } catch (error) {
        console.error(
          "Delete task error:",
          error,
        );

        if (error instanceof Error) {
          setTaskError(
            error.message,
          );
        } else {
          setTaskError(
            "Failed to delete task",
          );
        }
      } finally {
        setDeletingTask(false);
      }
    };

  /* =========================
     OPEN TASK
  ========================= */

  const handleOpenTask = (
    taskId: string,
  ) => {
    setOpenTaskMenuId(null);

    router.push(
      `/tasks/${taskId}`,
    );
  };

  /* =========================
     CLOSE MODALS
  ========================= */

  const handleCloseModal = () => {
    setShowAddTaskModal(false);
    setTaskError(null);
  };

  const handleCloseEditModal = () => {
    setShowEditTaskModal(false);
    setEditingTask(null);
    setEditingTaskId(null);
    setTaskError(null);
  };

  const handleCloseDeleteConfirm =
    () => {
      if (deletingTask) {
        return;
      }

      setShowDeleteConfirm(false);
      setDeletingTaskId(null);
      setTaskError(null);
    };

  /* =========================
     COMBINE TASKS
  ========================= */

  const displayColumns: Column[] =
    columns.map((column) => {
      const statusMap: Record<
        string,
        DatabaseTask["status"]
      > = {
        "To Do": "TODO",
        Doing: "DOING",
        Completed: "COMPLETED",
        "On Hold": "ON_HOLD",
      };

      const databaseColumnTasks: Task[] =
        databaseTasks
          .filter(
            (task) =>
              task.status ===
              statusMap[
                column.title
              ],
          )
          .map((task) => ({
            id: task.id,

            title: task.title,

            assignee:
              task.reporter?.name ||
              task.reporter?.email ||
              "Unassigned",

            assigneeAvatarUrl:
              task.reporter
                ?.avatarUrl ||
              null,

            dueDate: task.dueDate
              ? new Date(
                  task.dueDate,
                ).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                  },
                )
              : "No due date",

            labels:
              task.labels?.map(
                (taskLabel) =>
                  taskLabel.label.name,
              ) ?? [],

            priority:
              task.priority,
          }));

      return {
        ...column,

        tasks: [
          ...column.tasks,
          ...databaseColumnTasks,
        ],
      };
    });

  /* =========================
     SEARCH + FILTER
  ========================= */

  const filteredColumns =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return displayColumns.map(
        (column) => {
          const filteredTasks =
            column.tasks.filter(
              (task) => {
                const matchesSearch =
                  !query ||
                  task.title
                    .toLowerCase()
                    .includes(query) ||
                  task.assignee
                    .toLowerCase()
                    .includes(query) ||
                  task.dueDate
                    .toLowerCase()
                    .includes(query) ||
                  task.labels.some(
                    (label) =>
                      label
                        .toLowerCase()
                        .includes(query),
                  );

                const matchesStatus =
                  !filters.status ||
                  column.title ===
                    filters.status;

                const matchesPriority =
                  !filters.priority ||
                  task.priority ===
                    filters.priority;

                const matchesAssignee =
                  !filters.assignee ||
                  task.assignee ===
                    filters.assignee;

                const matchesDueDate =
                  !filters.dueDate ||
                  (filters.dueDate ===
                  "NO_DATE"
                    ? task.dueDate ===
                      "No due date"
                    : task.dueDate ===
                      filters.dueDate);

                const matchesLabel =
                  !filters.label ||
                  task.labels.includes(
                    filters.label,
                  );

                return (
                  matchesSearch &&
                  matchesStatus &&
                  matchesPriority &&
                  matchesAssignee &&
                  matchesDueDate &&
                  matchesLabel
                );
              },
            );

          return {
            ...column,
            tasks: filteredTasks,
          };
        },
      );
    }, [
      displayColumns,
      searchQuery,
      filters,
    ]);

  /* =========================
     FILTER OPTIONS
  ========================= */

  const assigneeOptions =
    Array.from(
      new Set(
        displayColumns.flatMap(
          (column) =>
            column.tasks.map(
              (task) =>
                task.assignee,
            ),
        ),
      ),
    );

  const dueDateOptions =
    Array.from(
      new Set(
        displayColumns.flatMap(
          (column) =>
            column.tasks.map(
              (task) =>
                task.dueDate,
            ),
        ),
      ),
    );

  const labelOptions =
    Array.from(
      new Set(
        displayColumns.flatMap(
          (column) =>
            column.tasks.flatMap(
              (task) =>
                task.labels,
            ),
        ),
      ),
    );

  const openAddTask = (
    taskStatus = "TODO",
  ) => {
    setStatus(taskStatus);
    setTaskError(null);
    setShowAddTaskModal(true);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      assignee: "",
      dueDate: "",
      label: "",
    });
  };

  const hasActiveFilters =
    Boolean(
      filters.status ||
        filters.priority ||
        filters.assignee ||
        filters.dueDate ||
        filters.label,
    );

    return (
    <>
      <main className="relative min-h-screen min-w-0 overflow-x-hidden bg-ui-surface">

        {/* =========================
            MAIN HEADER
        ========================= */}

        <div
          className="
            relative
            z-[100]
            flex
            min-h-20
            flex-col
            gap-3
            border-b
            border-ui-border
            bg-ui-surface
            px-4
            py-3
            sm:px-5
            sm:py-4
            md:flex-row
            md:items-center
            md:justify-between
            md:px-7
            md:py-4
          "
        >

          {/* =========================
              LEFT SIDE
          ========================= */}

          <div className="flex min-w-0 items-center gap-3">

            {/* BOARD / LIST SWITCH */}

            <div className="relative shrink-0">

              <button
                type="button"
                onClick={() =>
                  setShowViewMenu(
                    (current) => !current,
                  )
                }
                aria-label="Change task view"
                aria-expanded={showViewMenu}
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  transition
                  ${
                    showViewMenu
                      ? "border-ui-text-muted bg-ui-surface-muted"
                      : "border-ui-border hover:bg-ui-bg"
                  }
                `}
              >

                {taskView === "board" ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-ui-text"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="6"
                      height="16"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <rect
                      x="14"
                      y="4"
                      width="6"
                      height="16"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-ui-text"
                  >
                    <path
                      d="M5 7H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M5 17H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

              </button>

              {/* BOARD / LIST DROPDOWN */}

              {showViewMenu && (
                <div
                  className="
                    absolute
                    left-0
                    top-11
                    z-[200]
                    w-32
                    overflow-hidden
                    rounded-lg
                    border
                    border-ui-border
                    bg-ui-surface
                    p-1
                    shadow-xl
                  "
                >

                  <button
                    type="button"
                    onClick={() => {
                      setTaskView("board");
                      setShowViewMenu(false);
                    }}
                    className={`
                      flex
                      w-full
                      items-center
                      gap-2
                      rounded-md
                      px-2.5
                      py-2
                      text-left
                      text-xs
                      font-semibold
                      ${
                        taskView === "board"
                          ? "bg-ui-surface-muted text-ui-text"
                          : "text-ui-text-secondary hover:bg-ui-bg"
                      }
                    `}
                  >
                    <span className="text-ui-text">
                      ▥
                    </span>

                    Board
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTaskView("list");
                      setShowViewMenu(false);
                    }}
                    className={`
                      flex
                      w-full
                      items-center
                      gap-2
                      rounded-md
                      px-2.5
                      py-2
                      text-left
                      text-xs
                      font-semibold
                      ${
                        taskView === "list"
                          ? "bg-ui-surface-muted text-ui-text"
                          : "text-ui-text-secondary hover:bg-ui-bg"
                      }
                    `}
                  >
                    <span className="text-ui-text">
                      ☰
                    </span>

                    List
                  </button>

                </div>
              )}

            </div>

            {/* TITLE */}

            <h1
              className="
                truncate
                text-xl
                font-semibold
                text-ui-text
              "
            >
              Tasks
            </h1>

          </div>

          {/* =========================
              RIGHT SIDE CONTROLS
          ========================= */}

          <div
            className="
              flex
              w-full
              min-w-0
              flex-wrap
              items-center
              gap-2
              md:w-auto
              md:justify-end
            "
          >

            {/* SEARCH INPUT */}

            {searchOpen && (
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder="Search tasks..."
                className="
                  order-first
                  h-9
                  w-full
                  min-w-0
                  rounded-lg
                  border
                  border-ui-border
                  bg-ui-surface
                  px-3
                  text-xs
                  font-semibold
                  text-ui-text
                  outline-none
                  placeholder:text-ui-text-muted
                  focus:border-ui-text-muted
                  sm:w-48
                  md:order-none
                "
              />
            )}

            {/* SEARCH BUTTON */}

            <button
              type="button"
              aria-label="Search tasks"
              onClick={() =>
                setSearchOpen(
                  (current) => !current,
                )
              }
              className={`
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                text-ui-text
                transition
                ${
                  searchOpen || searchQuery
                    ? "border-ui-text-muted bg-ui-bg"
                    : "border-ui-border hover:bg-ui-bg"
                }
              `}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M16 16L20 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* FIELDS */}

            <div className="relative shrink-0">

              <button
                type="button"
                onClick={() =>
                  setShowFieldsMenu(
                    (current) => !current,
                  )
                }
                className={`
                  rounded-lg
                  border
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-ui-text
                  transition
                  ${
                    showFieldsMenu
                      ? "border-ui-text-muted bg-ui-bg"
                      : "border-ui-border hover:bg-ui-bg"
                  }
                `}
              >
                ▥ Fields
              </button>

              {showFieldsMenu && (
                <div
                  className="
                    absolute
                    left-0
                    top-11
                    z-[300]
                    w-48
                    max-w-[calc(100vw-1rem)]
                    rounded-lg
                    border
                    border-ui-border
                    bg-ui-surface
                    p-2
                    shadow-xl
                  "
                >

                  <p className="px-2 py-2 text-xs font-bold text-ui-text-muted">
                    Fields
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setVisibleFields(
                        (current) => ({
                          ...current,
                          priority:
                            !current.priority,
                        }),
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs font-semibold text-ui-text hover:bg-ui-bg"
                  >
                    Priority

                    <span>
                      {visibleFields.priority
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setVisibleFields(
                        (current) => ({
                          ...current,
                          assignee:
                            !current.assignee,
                        }),
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs font-semibold text-ui-text hover:bg-ui-bg"
                  >
                    Assignee

                    <span>
                      {visibleFields.assignee
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setVisibleFields(
                        (current) => ({
                          ...current,
                          dueDate:
                            !current.dueDate,
                        }),
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs font-semibold text-ui-text hover:bg-ui-bg"
                  >
                    Due Date

                    <span>
                      {visibleFields.dueDate
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setVisibleFields(
                        (current) => ({
                          ...current,
                          labels:
                            !current.labels,
                        }),
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs font-semibold text-ui-text hover:bg-ui-bg"
                  >
                    Labels

                    <span>
                      {visibleFields.labels
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                </div>
              )}

            </div>

            {/* FILTER */}

            <div className="relative shrink-0">

              <button
                type="button"
                aria-label="Filter tasks"
                onClick={() =>
                  setShowFilterMenu(
                    (current) => !current,
                  )
                }
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  text-ui-text
                  transition
                  ${
                    showFilterMenu ||
                    hasActiveFilters
                      ? "border-ui-text-muted bg-ui-bg"
                      : "border-ui-border hover:bg-ui-bg"
                  }
                `}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M4 5H20L14 12V18L10 20V12L4 5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {showFilterMenu && (
                <div
                  className="
                    absolute
                    right-0
                    top-11
                    z-[300]
                    w-64
                    max-w-[calc(100vw-1rem)]
                    rounded-lg
                    border
                    border-ui-border
                    bg-ui-surface
                    p-3
                    shadow-xl
                  "
                >

                  <div className="flex items-center justify-between px-2 py-2">

                    <span className="text-xs font-bold text-ui-text">
                      Filter Tasks
                    </span>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs font-semibold text-ui-text-muted hover:text-ui-text"
                      >
                        Clear
                      </button>
                    )}

                  </div>

                  {/* STATUS */}

                  <label className="block px-2 py-1">

                    <span className="text-[11px] font-bold text-ui-text-muted">
                      Status
                    </span>

                    <select
                      value={filters.status}
                      onChange={(event) =>
                        setFilters(
                          (current) => ({
                            ...current,
                            status:
                              event.target.value,
                          }),
                        )
                      }
                      className="mt-1 w-full rounded-md border border-ui-border bg-ui-surface px-2 py-1.5 text-xs font-semibold text-ui-text outline-none"
                    >
                      <option value="">
                        All Status
                      </option>

                      <option value="To Do">
                        To Do
                      </option>

                      <option value="Doing">
                        Doing
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="On Hold">
                        On Hold
                      </option>
                    </select>

                  </label>

                  {/* PRIORITY */}

                  <label className="block px-2 py-1">

                    <span className="text-[11px] font-bold text-ui-text-muted">
                      Priority
                    </span>

                    <select
                      value={filters.priority}
                      onChange={(event) =>
                        setFilters(
                          (current) => ({
                            ...current,
                            priority:
                              event.target.value,
                          }),
                        )
                      }
                      className="mt-1 w-full rounded-md border border-ui-border bg-ui-surface px-2 py-1.5 text-xs font-semibold text-ui-text outline-none"
                    >
                      <option value="">
                        All Priorities
                      </option>

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

                  </label>

                  {/* MEMBERS */}

                  <label className="block px-2 py-1">

                    <span className="text-[11px] font-bold text-ui-text-muted">
                      Members
                    </span>

                    <select
                      value={filters.assignee}
                      onChange={(event) =>
                        setFilters(
                          (current) => ({
                            ...current,
                            assignee:
                              event.target.value,
                          }),
                        )
                      }
                      className="mt-1 w-full rounded-md border border-ui-border bg-ui-surface px-2 py-1.5 text-xs font-semibold text-ui-text outline-none"
                    >
                      <option value="">
                        All Members
                      </option>

                      {assigneeOptions.map(
                        (assignee) => (
                          <option
                            key={assignee}
                            value={assignee}
                          >
                            {assignee}
                          </option>
                        ),
                      )}
                    </select>

                  </label>

                  {/* DUE DATE */}

                  <label className="block px-2 py-1">

                    <span className="text-[11px] font-bold text-ui-text-muted">
                      Due Date
                    </span>

                    <select
                      value={filters.dueDate}
                      onChange={(event) =>
                        setFilters(
                          (current) => ({
                            ...current,
                            dueDate:
                              event.target.value,
                          }),
                        )
                      }
                      className="mt-1 w-full rounded-md border border-ui-border bg-ui-surface px-2 py-1.5 text-xs font-semibold text-ui-text outline-none"
                    >
                      <option value="">
                        All Due Dates
                      </option>

                      <option value="NO_DATE">
                        No Due Date
                      </option>

                      {dueDateOptions
                        .filter(
                          (date) =>
                            date !==
                            "No due date",
                        )
                        .map((date) => (
                          <option
                            key={date}
                            value={date}
                          >
                            {date}
                          </option>
                        ))}
                    </select>

                  </label>

                  {/* LABELS */}

                  <label className="block px-2 py-1">

                    <span className="text-[11px] font-bold text-ui-text-muted">
                      Labels
                    </span>

                    <select
                      value={filters.label}
                      onChange={(event) =>
                        setFilters(
                          (current) => ({
                            ...current,
                            label:
                              event.target.value,
                          }),
                        )
                      }
                      className="mt-1 w-full rounded-md border border-ui-border bg-ui-surface px-2 py-1.5 text-xs font-semibold text-ui-text outline-none"
                    >
                      <option value="">
                        All Labels
                      </option>

                      {labelOptions.map(
                        (label) => (
                          <option
                            key={label}
                            value={label}
                          >
                            {label}
                          </option>
                        ),
                      )}
                    </select>

                  </label>

                </div>
              )}

            </div>

            {/* ADD TASK */}

            <button
              type="button"
              onClick={() =>
                openAddTask("TODO")
              }
              className="
                shrink-0
                rounded-lg
                bg-gray-900
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-gray-800
              "
            >
              + Add Task
            </button>

          </div>

        </div>

        {/* =========================
            BOARD
        ========================= */}

        {taskView === "board" && (
          <div
            className="
              relative
              z-0
              min-w-0
              px-3
              pb-6
              pt-4
              sm:px-5
              sm:pb-7
              sm:pt-5
              md:px-7
            "
          >

            <div
              className="
                w-full
                min-w-0
                overflow-x-auto
                overflow-y-visible
                overscroll-x-contain
                touch-pan-x
                pb-3
                [scrollbar-width:thin]
              "
            >

              <div className="flex w-max min-w-full items-start gap-4">

                {filteredColumns.map(
                  (column) => (
                    <TaskColumn
                      key={column.title}
                      title={column.title}
                      tasks={column.tasks}
                      visibleFields={
                        visibleFields
                      }
                      onAddTask={(
                        taskStatus,
                      ) => {
                        setStatus(
                          taskStatus,
                        );
                        setTaskError(null);
                        setShowAddTaskModal(
                          true,
                        );
                      }}
                      onEditTask={
                        handleOpenEditTask
                      }
                      onDeleteTask={
                        handleOpenDeleteConfirm
                      }
                      onOpenTask={
                        handleOpenTask
                      }
                      openTaskMenuId={
                        openTaskMenuId
                      }
                      setOpenTaskMenuId={
                        setOpenTaskMenuId
                      }
                    />
                  ),
                )}

              </div>

            </div>

          </div>
        )}

        {/* =========================
            LIST
        ========================= */}

        {taskView === "list" && (
          <div className="w-full min-w-0 overflow-x-auto">

            <TaskListView
              columns={filteredColumns}
              visibleFields={
                visibleFields
              }
              onAddTask={openAddTask}
              onOpenTask={
                handleOpenTask
              }
              onEditTask={
                handleOpenEditTask
              }
              onDeleteTask={
                handleOpenDeleteConfirm
              }
              openTaskMenuId={
                openTaskMenuId
              }
              setOpenTaskMenuId={
                setOpenTaskMenuId
              }
            />

          </div>
        )}

      </main>

      {/* =========================
          ADD TASK MODAL
      ========================= */}

      <AddTaskModal
        showAddTaskModal={
          showAddTaskModal
        }
        title={title}
        description={description}
        status={status}
        priority={priority}
        dueDate={dueDate}
        creatingTask={
          creatingTask
        }
        taskError={taskError}
        setTitle={setTitle}
        setDescription={
          setDescription
        }
        setStatus={setStatus}
        setPriority={setPriority}
        setDueDate={setDueDate}
        handleCreateTask={
          handleCreateTask
        }
        handleCloseModal={
          handleCloseModal
        }
      />

      {/* =========================
          EDIT TASK MODAL
      ========================= */}

      <EditTaskModal
        showEditTaskModal={
          showEditTaskModal
        }
        editingTask={
          editingTask
        }
        setEditingTask={
          setEditingTask
        }
        taskError={
          taskError
        }
        updatingTask={
          updatingTask
        }
        handleUpdateTask={
          handleUpdateTask
        }
        handleCloseEditModal={
          handleCloseEditModal
        }
      />

      {/* =========================
          DELETE TASK MODAL
      ========================= */}

      <DeleteTaskModal
        showDeleteConfirm={
          showDeleteConfirm
        }
        deletingTask={
          deletingTask
        }
        taskError={
          taskError
        }
        handleDeleteTask={
          handleDeleteTask
        }
        handleCloseDeleteConfirm={
          handleCloseDeleteConfirm
        }
      />

    </>
  );
}