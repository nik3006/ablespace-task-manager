"use client";

import { useState } from "react";

type WorkspaceMember = {
  id: string;
  userId: string;
  workspaceId: string;
  role: "OWNER" | "MEMBER" | "GUEST";
};

type Workspace = {
  id: string;
  name: string;
  members: WorkspaceMember[];
};

type WorkspaceAccessProps = {
  workspaces: Workspace[];
  currentUserId: string;
  onLeaveWorkspace: (
    workspaceId: string,
  ) => Promise<void>;
};

export default function WorkspaceAccess({
  workspaces,
  currentUserId,
  onLeaveWorkspace,
}: WorkspaceAccessProps) {
  const [
    leavingWorkspaceId,
    setLeavingWorkspaceId,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const handleLeaveWorkspace = async (
    workspaceId: string,
  ) => {
    setError(null);

    setLeavingWorkspaceId(
      workspaceId,
    );

    try {
      await onLeaveWorkspace(
        workspaceId,
      );
    } catch (error) {
      console.error(
        "Failed to leave workspace:",
        error,
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to leave workspace",
        );
      }
    } finally {
      setLeavingWorkspaceId(null);
    }
  };

  return (
    <section className="mt-6 w-full min-w-0 sm:mt-8">

      {/* HEADER */}

      <h2 className="mb-4 text-sm font-medium text-ui-text">
        Workspace access
      </h2>

      {/* ERROR */}

      {error && (
        <div className="mb-3 w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* NO WORKSPACES */}

      {workspaces.length === 0 ? (

        <div className="w-full rounded-xl border border-ui-border bg-ui-surface px-4 py-4 sm:px-5 sm:py-5">

          <p className="text-sm text-ui-text-muted">
            You are not a member of any
            workspace.
          </p>

        </div>

      ) : (

        /* WORKSPACES */

        <div className="w-full min-w-0 space-y-3">

          {workspaces.map(
            (workspace) => {
              const currentMember =
                workspace.members.find(
                  (member) =>
                    member.userId ===
                    currentUserId,
                );

              const isOwner =
                currentMember?.role ===
                "OWNER";

              const isLeaving =
                leavingWorkspaceId ===
                workspace.id;

              return (
                <div
                  key={workspace.id}
                  className="
                    flex
                    min-w-0
                    flex-col
                    gap-4
                    rounded-xl
                    border
                    border-ui-border
                    bg-ui-surface
                    px-4
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-5
                    sm:py-5
                  "
                >

                  {/* WORKSPACE INFORMATION */}

                  <div className="min-w-0">

                    <p className="truncate text-sm text-ui-text">
                      {workspace.name}
                    </p>

                    {isOwner ? (

                      <p className="mt-1 text-xs leading-5 text-ui-text-muted">
                        You are the owner of
                        this workspace.
                      </p>

                    ) : (

                      <p className="mt-1 text-xs leading-5 text-ui-text-muted">
                        You will lose access
                        to this workspace.
                      </p>

                    )}

                  </div>

                  {/* LEAVE BUTTON */}

                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() =>
                        handleLeaveWorkspace(
                          workspace.id,
                        )
                      }
                      disabled={isLeaving}
                      className="
                        w-full
                        shrink-0
                        rounded-lg
                        bg-red-50
                        px-4
                        py-2.5
                        text-xs
                        font-medium
                        text-red-600
                        transition
                        hover:bg-red-100
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        sm:w-auto
                      "
                    >
                      {isLeaving
                        ? "Leaving..."
                        : "Leave Workspace"}
                    </button>
                  )}

                </div>
              );
            },
          )}

        </div>

      )}

    </section>
  );
}