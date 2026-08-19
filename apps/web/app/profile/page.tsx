"use client";

import { useEffect, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import ProfileSidebar from "@/components/layout/ProfileSidebar";
import { apiFetch } from "@/lib/api";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInformation from "@/components/profile/ProfileInformation";
import WorkspaceAccess from "@/components/profile/WorkspaceAccess";

type User = {
  id: string;
  email: string | null;
  fullName: string;
  username: string | null;
  title: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type WorkspaceMember = {
  id: string;
  userId: string;
  workspaceId: string;
  role: "OWNER" | "MEMBER" | "GUEST";
};

type Workspace = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
};

export default function ProfilePage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingWorkspaces,
    setLoadingWorkspaces,
  ] = useState(true);

  // Load current user's profile
  useEffect(() => {
    apiFetch("/users/me")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load profile",
          );
        }

        return response.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error(
          "Profile error:",
          error,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Load user's workspaces
  useEffect(() => {
    apiFetch("/workspaces")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load workspaces",
          );
        }

        return response.json();
      })
      .then((data) => {
        setWorkspaces(data);
      })
      .catch((error) => {
        console.error(
          "Workspace loading error:",
          error,
        );
      })
      .finally(() => {
        setLoadingWorkspaces(false);
      });
  }, []);

  // Update normal profile fields
  const updateProfile = async (data: {
    fullName?: string;
    title?: string;
    username?: string;
  }) => {
    const response = await apiFetch(
      "/users/me",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to update profile",
      );
    }

    setUser(result);
  };

  // Upload profile picture
  const uploadAvatar = async (
    file: File,
  ) => {
    const formData =
      new FormData();

    formData.append(
      "avatar",
      file,
    );

    const response =
      await apiFetch(
        "/users/me/avatar",
        {
          method: "POST",
          body: formData,
        },
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to upload profile picture",
      );
    }

    setUser(result);
  };

  // Leave a workspace
  const leaveWorkspace = async (
    workspaceId: string,
  ) => {
    const response =
      await apiFetch(
        `/workspaces/${workspaceId}/leave`,
        {
          method: "DELETE",
        },
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to leave workspace",
      );
    }

    setWorkspaces(
      (currentWorkspaces) =>
        currentWorkspaces.filter(
          (workspace) =>
            workspace.id !==
            workspaceId,
        ),
    );
  };

  return (
    <AppShell
      sidebar={<ProfileSidebar />}
      responsiveSidebar
    >
      <main
        className="
          min-h-screen
          min-w-0
          w-full
          bg-ui-bg
          px-4
          py-6
          sm:px-6
          sm:py-8
          md:px-8
          md:py-10
          lg:px-10
          lg:py-12
        "
      >
        <div
          className="
            mx-auto
            w-full
            min-w-0
            max-w-2xl
          "
        >

          {/* LOADING */}

          {loading && (
            <p className="text-sm text-ui-text-muted">
              Loading profile...
            </p>
          )}

          {/* PROFILE */}

          {!loading && user && (
            <div className="w-full min-w-0">

              {/* HEADER */}

              <ProfileHeader
                fullName={
                  user.fullName
                }
                avatarUrl={
                  user.avatarUrl
                }
              />

              {/* PROFILE INFORMATION */}

              <ProfileInformation
                email={
                  user.email
                }
                fullName={
                  user.fullName
                }
                title={
                  user.title
                }
                username={
                  user.username
                }
                avatarUrl={
                  user.avatarUrl
                }
                onUpdate={
                  updateProfile
                }
                onAvatarUpload={
                  uploadAvatar
                }
              />

              {/* WORKSPACE ACCESS */}

              {loadingWorkspaces ? (

                <section className="mt-6 sm:mt-8">

                  <h2 className="mb-4 text-sm font-medium text-ui-text">
                    Workspace access
                  </h2>

                  <p className="text-sm text-ui-text-muted">
                    Loading workspaces...
                  </p>

                </section>

              ) : (

                <WorkspaceAccess
                  workspaces={
                    workspaces
                  }
                  currentUserId={
                    user.id
                  }
                  onLeaveWorkspace={
                    leaveWorkspace
                  }
                />

              )}

            </div>
          )}

          {/* ERROR */}

          {!loading && !user && (
            <p className="text-sm text-red-500">
              Failed to load profile.
            </p>
          )}

        </div>
      </main>
    </AppShell>
  );
}