"use client";

type DeleteTaskModalProps = {
  showDeleteConfirm: boolean;
  deletingTask: boolean;
  taskError: string | null;

  handleDeleteTask: () => void;
  handleCloseDeleteConfirm: () => void;
};

export default function DeleteTaskModal({
  showDeleteConfirm,
  deletingTask,
  taskError,
  handleDeleteTask,
  handleCloseDeleteConfirm,
}: DeleteTaskModalProps) {
  if (!showDeleteConfirm) {
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
      onClick={handleCloseDeleteConfirm}
    >
      <div
        className="
          w-full
          max-w-sm
          rounded-xl
          bg-ui-surface
          p-4
          shadow-xl
          sm:p-5
          md:p-6
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* =========================
            HEADER
        ========================= */}

        <h2 className="text-base font-bold text-ui-text sm:text-lg">
          Delete Task
        </h2>

        {/* =========================
            DESCRIPTION
        ========================= */}

        <p className="mt-2 text-sm leading-5 text-ui-text-secondary sm:leading-6">
          Are you sure you want to delete this
          task? This action cannot be undone.
        </p>

        {/* =========================
            ERROR
        ========================= */}

        {taskError && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 sm:text-sm">
            {taskError}
          </div>
        )}

        {/* =========================
            BUTTONS
        ========================= */}

        <div
          className="
            mt-5
            flex
            flex-col-reverse
            gap-2
            sm:mt-6
            sm:flex-row
            sm:justify-end
          "
        >

          {/* CANCEL */}

          <button
            type="button"
            disabled={deletingTask}
            onClick={
              handleCloseDeleteConfirm
            }
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

          {/* DELETE */}

          <button
            type="button"
            disabled={deletingTask}
            onClick={handleDeleteTask}
            className="
              w-full
              rounded-lg
              bg-red-600
              px-4
              py-2.5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            {deletingTask
              ? "Deleting..."
              : "Delete Task"}
          </button>

        </div>

      </div>
    </div>
  );
}