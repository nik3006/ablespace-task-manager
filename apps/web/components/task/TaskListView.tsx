"use client";

import type {
  Column,
  TaskVisibleFields,
} from "./TaskBoard";

type TaskListViewProps = {
  columns: Column[];
  visibleFields: TaskVisibleFields;

  onAddTask: (
    taskStatus: string,
  ) => void;

  onOpenTask: (
    taskId: string,
  ) => void;

  onEditTask: (
    taskId: string,
  ) => void;

  onDeleteTask: (
    taskId: string,
  ) => void;

  openTaskMenuId: string | null;

  setOpenTaskMenuId: (
    taskId: string | null,
  ) => void;
};

function getStatusValue(
  title: string,
) {
  const statusMap: Record<
    string,
    string
  > = {
    "To Do": "TODO",
    Doing: "DOING",
    Completed: "COMPLETED",
    "On Hold": "ON_HOLD",
  };

  return (
    statusMap[title] ??
    "TODO"
  );
}

function getPriorityLabel(
  priority: Column["tasks"][number]["priority"],
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

function getPriorityClass(
  priority: Column["tasks"][number]["priority"],
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

export default function TaskListView({
  columns,
  visibleFields,
  onAddTask,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  openTaskMenuId,
  setOpenTaskMenuId,
}: TaskListViewProps) {
  return (
    <div className="w-full min-w-0 space-y-4 px-3 pb-7 pt-4 sm:px-5 sm:pt-5 md:px-7">

      {columns.map((column) => {

        /*
         * Fixed column widths keep the content
         * readable on phones and tablets.
         *
         * Total width:
         *
         * Task       260px
         * Priority   120px
         * Assignee   150px
         * Due Date   120px
         * Actions     70px
         *
         * Total = 720px
         */
        const gridColumns = [
          "260px",

          visibleFields.priority
            ? "120px"
            : "",

          visibleFields.assignee
            ? "150px"
            : "",

          visibleFields.dueDate
            ? "120px"
            : "",

          "70px",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <section
            key={column.title}
            className="w-full min-w-0"
          >

            {/* =========================
                COLUMN TITLE
            ========================= */}

            <div className="mb-2 flex items-center gap-2 px-1">

              <span
                className="shrink-0 text-xs font-bold text-ui-text"
                aria-hidden="true"
              >
                ▾
              </span>

              <h2 className="text-sm font-semibold text-ui-text">
                {column.title}
              </h2>

            </div>

            {/* =========================
                HORIZONTAL SCROLL AREA
            ========================= */}

            <div
              className="
                w-full
                min-w-0
                max-w-full
                overflow-x-auto
                overflow-y-visible
                overscroll-x-contain
                touch-pan-x
                pb-2
                [scrollbar-width:thin]
              "
            >

              {/* =========================
                  TABLE
              ========================= */}

              <div
                className="
                  min-w-[720px]
                  w-max
                  overflow-visible
                  rounded-lg
                  border
                  border-ui-border
                  bg-ui-surface
                "
              >

                {/* =========================
                    HEADER
                ========================= */}

                <div
                  className="
                    grid
                    min-h-11
                    items-center
                    border-b
                    border-ui-border
                    bg-ui-surface-muted
                    px-4
                    py-3
                    text-xs
                    font-bold
                    text-ui-text
                  "
                  style={{
                    gridTemplateColumns:
                      gridColumns,
                  }}
                >

                  {/* TASK */}

                  <span className="min-w-0 pr-4">
                    Task
                  </span>

                  {/* PRIORITY */}

                  {visibleFields.priority && (
                    <span className="min-w-0">
                      Priority
                    </span>
                  )}

                  {/* ASSIGNEE */}

                  {visibleFields.assignee && (
                    <span className="min-w-0">
                      Assignee
                    </span>
                  )}

                  {/* DUE DATE */}

                  {visibleFields.dueDate && (
                    <span className="min-w-0">
                      Due Date
                    </span>
                  )}

                  {/* ACTIONS */}

                  <span className="text-center">
                    Actions
                  </span>

                </div>

                {/* =========================
                    TASKS
                ========================= */}

                {column.tasks.length === 0 ? (

                  <div className="px-4 py-4 text-sm text-ui-text-muted">
                    No tasks
                  </div>

                ) : (

                  column.tasks.map(
                    (
                      task,
                      index,
                    ) => {

                      const isMenuOpen =
                        task.id !== undefined &&
                        openTaskMenuId ===
                          task.id;

                      return (
                        <div
                          key={
                            task.id ??
                            `${column.title}-${task.title}-${index}`
                          }
                          onClick={() => {
                            if (task.id) {
                              onOpenTask(
                                task.id,
                              );
                            }
                          }}
                          className={`
                            relative
                            grid
                            min-h-12
                            cursor-pointer
                            items-center
                            border-b
                            border-ui-border
                            px-4
                            py-3
                            text-[13px]
                            transition
                            hover:bg-ui-bg
                            ${
                              isMenuOpen
                                ? "z-40"
                                : "z-0"
                            }
                          `}
                          style={{
                            gridTemplateColumns:
                              gridColumns,
                          }}
                        >

                          {/* =========================
                              TASK TITLE
                          ========================= */}

                          <span className="min-w-0 pr-4 font-medium text-ui-text">
                            <span className="block truncate">
                              {task.title}
                            </span>
                          </span>

                          {/* =========================
                              PRIORITY
                          ========================= */}

                          {visibleFields.priority && (
                            <span
                              className={`
                                flex
                                min-w-0
                                items-center
                                gap-2
                                font-medium
                                ${getPriorityClass(
                                  task.priority,
                                )}
                              `}
                            >

                              <PriorityIcon />

                              <span className="truncate">
                                {getPriorityLabel(
                                  task.priority,
                                )}
                              </span>

                            </span>
                          )}

                          {/* =========================
                              ASSIGNEE
                          ========================= */}

                          {visibleFields.assignee && (
                            <span className="min-w-0 pr-3 font-medium text-ui-text-secondary">
                              <span className="block truncate">
                                {task.assignee}
                              </span>
                            </span>
                          )}

                          {/* =========================
                              DUE DATE
                          ========================= */}

                          {visibleFields.dueDate && (
                            <span className="min-w-0 pr-3 font-medium text-ui-text-secondary">
                              <span className="block truncate">
                                {task.dueDate}
                              </span>
                            </span>
                          )}

                          {/* =========================
                              ACTIONS
                          ========================= */}

                          <div
                            className="relative flex min-w-0 justify-center"
                            onClick={(
                              event,
                            ) =>
                              event.stopPropagation()
                            }
                          >

                            <button
                              type="button"
                              onClick={(
                                event,
                              ) => {

                                event.stopPropagation();

                                if (!task.id) {
                                  return;
                                }

                                setOpenTaskMenuId(
                                  isMenuOpen
                                    ? null
                                    : task.id,
                                );
                              }}
                              disabled={
                                !task.id
                              }
                              className="
                                flex
                                h-7
                                w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-md
                                text-xs
                                font-bold
                                leading-none
                                text-ui-text
                                transition
                                hover:bg-ui-surface-muted
                                disabled:cursor-default
                              "
                              aria-label="Task actions"
                            >
                              •••
                            </button>

                            {/* =========================
                                EDIT / DELETE MENU
                            ========================= */}

                            {isMenuOpen && (
                              <div
                                className="
                                  absolute
                                  right-0
                                  top-8
                                  z-[100]
                                  w-28
                                  overflow-hidden
                                  rounded-md
                                  border
                                  border-ui-border
                                  bg-ui-surface
                                  py-1
                                  shadow-lg
                                "
                                onClick={(
                                  event,
                                ) =>
                                  event.stopPropagation()
                                }
                              >

                                {/* EDIT */}

                                <button
                                  type="button"
                                  onClick={() => {

                                    if (
                                      task.id
                                    ) {

                                      setOpenTaskMenuId(
                                        null,
                                      );

                                      onEditTask(
                                        task.id,
                                      );
                                    }
                                  }}
                                  className="
                                    w-full
                                    px-3
                                    py-1.5
                                    text-left
                                    text-xs
                                    font-medium
                                    text-ui-text-secondary
                                    transition
                                    hover:bg-ui-surface-muted
                                  "
                                >
                                  Edit
                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() => {

                                    if (
                                      task.id
                                    ) {

                                      setOpenTaskMenuId(
                                        null,
                                      );

                                      onDeleteTask(
                                        task.id,
                                      );
                                    }
                                  }}
                                  className="
                                    w-full
                                    px-3
                                    py-1.5
                                    text-left
                                    text-xs
                                    font-medium
                                    text-red-500
                                    transition
                                    hover:bg-red-50
                                  "
                                >
                                  Delete
                                </button>

                              </div>
                            )}

                          </div>

                        </div>
                      );
                    },
                  )

                )}

                {/* =========================
                    ADD TASK
                ========================= */}

                <button
                  type="button"
                  onClick={() =>
                    onAddTask(
                      getStatusValue(
                        column.title,
                      ),
                    )
                  }
                  className="
                    w-full
                    px-4
                    py-2.5
                    text-left
                    text-xs
                    font-semibold
                    text-ui-text
                    transition
                    hover:bg-ui-bg
                  "
                >
                  + Add Task
                </button>

              </div>

            </div>

          </section>
        );
      })}

    </div>
  );
}