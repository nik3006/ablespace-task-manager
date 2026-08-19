"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE_URL, apiFetch } from "@/lib/api";

type Workspace = {
  id: string;
  name: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [showWorkspaceSelection, setShowWorkspaceSelection] =
    useState(false);

  const [workspaces, setWorkspaces] = useState<Workspace[]>(
    [],
  );

  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  // Google login
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // Open workspace selection
  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(
        "/workspaces/guest/available",
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load workspaces",
        );
      }

      setWorkspaces(data);
      setShowWorkspaceSelection(true);
    } catch (error) {
      console.error(
        "Workspace loading error:",
        error,
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load workspaces");
      }
    } finally {
      setLoading(false);
    }
  };

  // Guest login after selecting workspace
  const handleContinueAsGuest = async () => {
    if (!selectedWorkspaceId) {
      setError("Please select a workspace");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/auth/guest", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Guest login failed",
        );
      }

      // Backend has created the guest account
      // and stored the JWT in the cookie.
      router.push("/");
    } catch (error) {
      console.error(
        "Guest login error:",
        error,
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Guest login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Go back to the login options
  const handleBack = () => {
    setShowWorkspaceSelection(false);
    setSelectedWorkspaceId("");
    setError(null);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">

          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-lg font-medium text-white">
              A
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              AbleSpace
            </h1>
          </div>

          {/* Login card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            {!showWorkspaceSelection ? (
              <>
                {/* Login options */}

                <div className="text-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Let's get back on track
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Choose how you want to continue.
                  </p>
                </div>

                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    {error}
                  </div>
                )}

                {/* Guest */}
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Loading workspaces..."
                    : "Continue as Guest"}
                </button>

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                >
                  <span className="text-base font-semibold">
                    G
                  </span>

                  <span>Login with Google</span>
                </button>
              </>
            ) : (
              <>
                {/* Workspace selection */}

                <div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-xs text-gray-500 hover:text-gray-900"
                  >
                    ← Back
                  </button>

                  <h2 className="mt-5 text-lg font-medium text-gray-900">
                    Choose a workspace
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Select the workspace you want to
                    view as a guest.
                  </p>
                </div>

                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    {error}
                  </div>
                )}

                {/* Workspace list */}
                <div className="mt-5 space-y-2">
                  {workspaces.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No workspaces are available.
                    </p>
                  ) : (
                    workspaces.map((workspace) => (
                      <button
                        key={workspace.id}
                        type="button"
                        onClick={() =>
                          setSelectedWorkspaceId(
                            workspace.id,
                          )
                        }
                        className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                          selectedWorkspaceId ===
                          workspace.id
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {workspace.name}
                      </button>
                    ))
                  )}
                </div>

                {/* Continue */}
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  disabled={
                    loading ||
                    !selectedWorkspaceId
                  }
                  className="mt-5 flex w-full items-center justify-center rounded-full bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Signing in..."
                    : "Continue"}
                </button>
              </>
            )}
          </div>

          {/* Terms */}
          <p className="mx-auto mt-5 max-w-xs text-center text-[11px] leading-4 text-gray-400">
            By continuing, you agree to our{" "}
            <span className="underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline">
              Privacy Policy
            </span>
          </p>

        </div>
      </div>
    </main>
  );
}