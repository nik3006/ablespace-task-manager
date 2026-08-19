"use client";

type AddTaskModalProps = {
  showAddTaskModal: boolean;

  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;

  creatingTask: boolean;
  taskError: string | null;

  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setStatus: (value: string) => void;
  setPriority: (value: string) => void;
  setDueDate: (value: string) => void;

  handleCreateTask: () => void;
  handleCloseModal: () => void;
};

export default function AddTaskModal({
  showAddTaskModal,
  title,
  description,
  status,
  priority,
  dueDate,
  creatingTask,
  taskError,
  setTitle,
  setDescription,
  setStatus,
  setPriority,
  setDueDate,
  handleCreateTask,
  handleCloseModal,
}: AddTaskModalProps) {
  if (!showAddTaskModal) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-3
        sm:p-5
        md:p-6
      "
      onClick={handleCloseModal}
    >
      <div
        className="
          flex
          max-h-[calc(100vh-1.5rem)]
          w-full
          max-w-md
          flex-col
          overflow-hidden
          rounded-xl
          bg-ui-surface
          shadow-xl
          sm:max-h-[calc(100vh-2.5rem)]
          md:max-h-[calc(100vh-3rem)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* =========================
            HEADER
        ========================= */}

        <div className="flex shrink-0 items-center justify-between border-b border-ui-border px-4 py-4 sm:px-5 md:px-6">

          <h2 className="text-base font-bold text-ui-text sm:text-lg">
            Add Task
          </h2>

          <button
            type="button"
            onClick={handleCloseModal}
            disabled={creatingTask}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-md
              text-lg
              font-bold
              text-ui-text-muted
              transition
              hover:bg-ui-surface-muted
              hover:text-ui-text
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Close"
          >
            ×
          </button>

        </div>

        {/* =========================
            BODY
        ========================= */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 md:px-6">

          {/* ERROR */}

          {taskError && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 sm:text-sm">
              {taskError}
            </div>
          )}

          {/* =========================
              TITLE
          ========================= */}

          <div>

            <label
              htmlFor="add-task-title"
              className="text-xs font-bold text-ui-text sm:text-sm"
            >
              Task title
            </label>

            <input
              id="add-task-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Enter task title"
              className="
                mt-2
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
                transition
                placeholder:text-ui-text-muted
                focus:border-ui-text-muted
              "
            />

          </div>

          {/* =========================
              DESCRIPTION
          ========================= */}

          <div className="mt-4">

            <label
              htmlFor="add-task-description"
              className="text-xs font-bold text-ui-text sm:text-sm"
            >
              Description
            </label>

            <textarea
              id="add-task-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Enter task description"
              rows={3}
              className="
                mt-2
                min-h-[80px]
                w-full
                resize-none
                rounded-lg
                border
                border-ui-border
                bg-ui-surface
                px-3
                py-2.5
                text-sm
                text-ui-text
                outline-none
                transition
                placeholder:text-ui-text-muted
                focus:border-ui-text-muted
                sm:min-h-[90px]
              "
            />

          </div>

          {/* =========================
              STATUS + PRIORITY
          ========================= */}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* STATUS */}

            <div className="min-w-0">

              <label
                htmlFor="add-task-status"
                className="text-xs font-bold text-ui-text sm:text-sm"
              >
                Status
              </label>

              <select
                id="add-task-status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value,
                  )
                }
                className="
                  mt-2
                  w-full
                  min-w-0
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
                <option value="TODO">
                  To Do
                </option>

                <option value="DOING">
                  Doing
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="ON_HOLD">
                  On Hold
                </option>
              </select>

            </div>

            {/* PRIORITY */}

            <div className="min-w-0">

              <label
                htmlFor="add-task-priority"
                className="text-xs font-bold text-ui-text sm:text-sm"
              >
                Priority
              </label>

              <select
                id="add-task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value,
                  )
                }
                className="
                  mt-2
                  w-full
                  min-w-0
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

          </div>

          {/* =========================
              DUE DATE
          ========================= */}

          <div className="mt-4">

            <label
              htmlFor="add-task-due-date"
              className="text-xs font-bold text-ui-text sm:text-sm"
            >
              Due date
            </label>

            <input
              id="add-task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value,
                )
              }
              className="
                mt-2
                w-full
                min-w-0
                rounded-lg
                border
                border-ui-border
                bg-ui-surface
                px-3
                py-2.5
                text-sm
                text-ui-text
                outline-none
                transition
                focus:border-ui-text-muted
              "
            />

          </div>

        </div>

        {/* =========================
            BUTTONS
        ========================= */}

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
            sm:px-5
            md:px-6
          "
        >

          {/* CANCEL */}

          <button
            type="button"
            onClick={handleCloseModal}
            disabled={creatingTask}
            className="
              w-full
              rounded-lg
              border
              border-ui-border
              px-4
              py-2.5
              text-sm
              font-bold
              text-ui-text
              transition
              hover:bg-ui-bg
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            Cancel
          </button>

          {/* CREATE */}

          <button
            type="button"
            onClick={handleCreateTask}
            disabled={
              !title.trim() ||
              creatingTask
            }
            className="
              w-full
              rounded-lg
              bg-gray-900
              px-4
              py-2.5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            {creatingTask
              ? "Creating..."
              : "Create Task"}
          </button>

        </div>

      </div>
    </div>
  );
}