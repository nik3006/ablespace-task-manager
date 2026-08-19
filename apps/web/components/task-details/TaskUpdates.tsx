"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type TaskUpdatesProps = {
  assignee: string;
  workspaceId: string;
  taskId: string;
};

type TaskUpdate = {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  author?: {
    id: string;
    fullName: string;
    email?: string | null;
    username?: string | null;
  };
};

export default function TaskUpdates({
  assignee,
  workspaceId,
  taskId,
}: TaskUpdatesProps) {
  const [updates, setUpdates] =
    useState<TaskUpdate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [replyOpen, setReplyOpen] =
    useState(false);

  const [content, setContent] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingContent, setEditingContent] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [actionOpenId, setActionOpenId] =
    useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] =
    useState<string | null>(null);

  /* =========================
     LOAD UPDATES
  ========================= */

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${taskId}/updates`,
      );

      const text =
        await response.text();

      let data: any = null;

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            text ||
            "Failed to load updates",
        );
      }

      setUpdates(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (error) {
      console.error(
        "Load updates error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load updates",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId && taskId) {
      loadUpdates();
    }
  }, [workspaceId, taskId]);

  /* =========================
     CREATE COMMENT
  ========================= */

  const handleAddComment = async () => {
    const trimmedContent =
      content.trim();

    if (
      !trimmedContent ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${taskId}/updates`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            content: trimmedContent,
          }),
        },
      );

      const text =
        await response.text();

      let data: any = null;

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            text ||
            "Failed to add comment",
        );
      }

      await loadUpdates();

      setContent("");
      setReplyOpen(false);
    } catch (error) {
      console.error(
        "Add comment error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to add comment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     OPEN / CLOSE ACTION MENU
  ========================= */

  const handleActionClick = (
    updateId: string,
  ) => {
    setActionOpenId((current) =>
      current === updateId
        ? null
        : updateId,
    );
  };

  /* =========================
     START EDIT
  ========================= */

  const handleStartEdit = (
    update: TaskUpdate,
  ) => {
    setActionOpenId(null);
    setDeleteConfirmId(null);
    setEditingId(update.id);
    setEditingContent(
      update.content,
    );
    setError(null);
  };

  /* =========================
     CANCEL EDIT
  ========================= */

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
    setError(null);
  };

  /* =========================
     SAVE EDIT
  ========================= */

  const handleSaveEdit = async (
    updateId: string,
  ) => {
    const trimmedContent =
      editingContent.trim();

    if (!trimmedContent) {
      setError(
        "Comment cannot be empty",
      );
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${taskId}/updates/${updateId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            content: trimmedContent,
          }),
        },
      );

      const text =
        await response.text();

      let data: any = null;

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            text ||
            "Failed to update comment",
        );
      }

      setUpdates((current) =>
        current.map((update) =>
          update.id === updateId
            ? {
                ...update,
                content:
                  trimmedContent,
              }
            : update,
        ),
      );

      setEditingId(null);
      setEditingContent("");
    } catch (error) {
      console.error(
        "Update comment error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update comment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     OPEN DELETE CONFIRMATION
  ========================= */

  const handleDeleteClick = (
    updateId: string,
  ) => {
    setActionOpenId(null);
    setDeleteConfirmId(updateId);
    setError(null);
  };

  /* =========================
     CANCEL DELETE
  ========================= */

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
    setError(null);
  };

  /* =========================
     CONFIRM DELETE
  ========================= */

  const handleConfirmDelete = async (
    updateId: string,
  ) => {
    if (deletingId) {
      return;
    }

    setDeletingId(updateId);
    setError(null);

    try {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/tasks/${taskId}/updates/${updateId}`,
        {
          method: "DELETE",
        },
      );

      const text =
        await response.text();

      let data: any = null;

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            text ||
            "Failed to delete comment",
        );
      }

      setUpdates((current) =>
        current.filter(
          (update) =>
            update.id !== updateId,
        ),
      );

      if (editingId === updateId) {
        setEditingId(null);
        setEditingContent("");
      }

      setDeleteConfirmId(null);
    } catch (error) {
      console.error(
        "Delete comment error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete comment",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (
    value: string,
  ) => {
    return new Date(
      value,
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  return (
    <div className="mt-6 min-w-0">

      <h2 className="text-sm font-bold text-ui-text">
        Updates
      </h2>

      <div className="mt-3 min-w-0 overflow-hidden rounded-lg border border-ui-border bg-ui-surface">

        {/* =========================
            TASK OPENED
        ========================= */}

        <div className="flex min-w-0 items-start gap-3 border-b border-ui-border p-3 sm:p-4">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
            {assignee
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">

            <p className="break-words text-xs font-bold text-ui-text">
              {assignee}
            </p>

            <p className="mt-1 text-xs text-ui-text-muted">
              Task opened
            </p>

          </div>

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="border-b border-ui-border p-3 text-xs font-bold text-ui-text-muted sm:p-4">
            Loading updates...
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {!loading && error && (
          <div className="border-b border-ui-border bg-red-50 p-3 text-xs font-bold text-red-600 sm:p-4">
            <p className="break-words">
              {error}
            </p>
          </div>
        )}

        {/* =========================
            EXISTING COMMENTS
        ========================= */}

        {!loading &&
          updates.map(
            (update) => {
              const authorName =
                update.author?.fullName ||
                update.author?.username ||
                update.author?.email ||
                "User";

              const isEditing =
                editingId ===
                update.id;

              const isDeleting =
                deletingId ===
                update.id;

              const isDeleteConfirming =
                deleteConfirmId ===
                update.id;

              return (
                <div
                  key={update.id}
                  className="flex min-w-0 items-start gap-2.5 border-b border-ui-border p-3 sm:gap-3 sm:p-4"
                >

                  {/* =========================
                      AVATAR
                  ========================= */}

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                    {authorName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  {/* =========================
                      CONTENT
                  ========================= */}

                  <div className="min-w-0 flex-1">

                    {/* HEADER */}

                    <div className="flex min-w-0 items-start justify-between gap-2">

                      <div className="min-w-0 flex-1">

                        <p className="break-words text-xs font-bold text-ui-text">
                          {authorName}
                        </p>

                        <p className="mt-1 text-xs text-ui-text-muted">
                          {formatDate(
                            update.createdAt,
                          )}
                        </p>

                      </div>

                      {/* =========================
                          ACTIONS
                      ========================= */}

                      <div className="relative shrink-0">

                        <button
                          type="button"
                          disabled={
                            isDeleting ||
                            submitting
                          }
                          onMouseDown={(
                            event,
                          ) => {
                            event.preventDefault();
                          }}
                          onClick={() =>
                            handleActionClick(
                              update.id,
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-ui-text-secondary transition hover:bg-ui-surface-muted hover:text-ui-text disabled:opacity-50"
                        >
                          •••
                        </button>

                        {actionOpenId ===
                          update.id && (
                          <div className="absolute right-0 top-8 z-50 w-28 overflow-hidden rounded-lg border border-ui-border bg-ui-surface py-1 shadow-lg">

                            <button
                              type="button"
                              onMouseDown={(
                                event,
                              ) => {
                                event.preventDefault();
                              }}
                              onClick={() =>
                                handleStartEdit(
                                  update,
                                )
                              }
                              className="w-full px-3 py-2 text-left text-xs font-bold text-ui-text-secondary transition hover:bg-ui-surface-muted"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onMouseDown={(
                                event,
                              ) => {
                                event.preventDefault();
                              }}
                              onClick={() =>
                                handleDeleteClick(
                                  update.id,
                                )
                              }
                              className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 transition hover:bg-ui-surface-muted"
                            >
                              Delete
                            </button>

                          </div>
                        )}

                      </div>

                    </div>

                    {/* =========================
                        DELETE CONFIRMATION
                    ========================= */}

                    {isDeleteConfirming ? (
                      <div className="mt-3 min-w-0">

                        <p className="break-words text-xs text-ui-text-secondary">
                          Delete this
                          comment?
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleConfirmDelete(
                                update.id,
                              )
                            }
                            disabled={
                              isDeleting
                            }
                            className="rounded-md bg-gray-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                          >
                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleCancelDelete
                            }
                            disabled={
                              isDeleting
                            }
                            className="px-2 py-2 text-xs font-bold text-ui-text-muted hover:text-ui-text disabled:opacity-50"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>
                    ) : isEditing ? (

                      /* =========================
                          EDIT COMMENT
                      ========================= */

                      <div className="mt-3 min-w-0">

                        <textarea
                          autoFocus
                          value={
                            editingContent
                          }
                          onChange={(
                            event,
                          ) =>
                            setEditingContent(
                              event.target
                                .value,
                            )
                          }
                          rows={3}
                          className="box-border min-h-[80px] w-full max-w-full resize-y rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-sm text-ui-text outline-none focus:border-ui-text-muted"
                        />

                        <div className="mt-2 flex flex-wrap items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleSaveEdit(
                                update.id,
                              )
                            }
                            disabled={
                              !editingContent.trim() ||
                              submitting
                            }
                            className="rounded-md bg-gray-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                          >
                            {submitting
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleCancelEdit
                            }
                            disabled={
                              submitting
                            }
                            className="px-2 py-2 text-xs font-bold text-ui-text-muted hover:text-ui-text disabled:opacity-50"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>

                    ) : (

                      /* =========================
                          COMMENT
                      ========================= */

                      <p className="mt-2 break-words text-xs leading-5 text-ui-text-secondary [overflow-wrap:anywhere]">
                        {update.content}
                      </p>

                    )}

                  </div>

                </div>
              );
            },
          )}

        {/* =========================
            REPLY
        ========================= */}

        {replyOpen ? (
          <div className="flex min-w-0 items-start gap-2.5 p-3 sm:gap-3 sm:p-4">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ui-surface-muted text-xs font-bold text-ui-text-secondary">
              +
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">

              <textarea
                autoFocus
                value={content}
                onChange={(event) =>
                  setContent(
                    event.target.value,
                  )
                }
                placeholder="Leave a reply..."
                rows={3}
                className="box-border min-h-[80px] w-full max-w-full resize-y rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-sm text-ui-text outline-none focus:border-ui-text-muted"
              />

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={
                    handleAddComment
                  }
                  disabled={
                    !content.trim() ||
                    submitting
                  }
                  className="rounded-md bg-gray-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {submitting
                    ? "Adding..."
                    : "Reply"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReplyOpen(false);
                    setContent("");
                    setError(null);
                  }}
                  disabled={
                    submitting
                  }
                  className="px-2 py-2 text-xs font-bold text-ui-text-muted hover:text-ui-text disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setReplyOpen(true);
              setError(null);
            }}
            className="flex w-full min-w-0 items-center gap-2.5 p-3 text-left sm:gap-3 sm:p-4"
          >

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ui-surface-muted text-xs font-bold text-ui-text-secondary">
              +
            </div>

            <span className="min-w-0 truncate text-sm text-ui-text-muted">
              Leave a reply...
            </span>

          </button>
        )}

      </div>

      <div className="mt-4 rounded-lg border border-ui-border bg-ui-surface px-4 py-5 text-sm text-ui-text-muted">
        Add a comment...
      </div>

    </div>
  );
}