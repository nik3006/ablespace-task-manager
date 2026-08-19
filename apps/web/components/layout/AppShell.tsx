"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "./Sidebar";
import { apiFetch } from "@/lib/api";

type AppShellProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;

  /*
   * Used for pages such as Profile where
   * the sidebar becomes a top navigation
   * on mobile.
   */
  responsiveSidebar?: boolean;
};

export default function AppShell({
  children,
  sidebar,
  responsiveSidebar = false,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/users/me")
      .then((response) => {
        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          router.replace(
            `/login?from=${encodeURIComponent(
              pathname,
            )}`,
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to verify session",
          );
        }

        setCheckingAuth(false);
      })
      .catch((error) => {
        console.error(
          "Auth check error:",
          error,
        );

        if (!cancelled) {
          router.replace("/login");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-bg">
        <p className="text-sm text-ui-text-muted">
          Loading...
        </p>
      </div>
    );
  }

  /*
   * ==========================================
   * RESPONSIVE SIDEBAR LAYOUT
   * ==========================================
   *
   * Mobile:
   *
   * ┌─────────────────────────────┐
   * │ Profile / Theme / Color    │
   * ├─────────────────────────────┤
   * │                             │
   * │ Page content                │
   * │                             │
   * └─────────────────────────────┘
   *
   * Tablet/Desktop:
   *
   * ┌──────────────┬───────────────┐
   * │ Sidebar      │ Page content  │
   * │              │               │
   * └──────────────┴───────────────┘
   */

  if (responsiveSidebar) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">

        {/* SIDEBAR */}

        <div className="w-full shrink-0 md:w-auto">
          {sidebar}
        </div>

        {/* PAGE CONTENT */}

        <div className="min-w-0 flex-1 bg-ui-bg pb-16 md:pb-0">
          {children}
        </div>

      </div>
    );
  }

  /*
   * ==========================================
   * NORMAL APP LAYOUT
   * ==========================================
   *
   * This remains unchanged for the rest
   * of the application.
   */

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}

      {sidebar ?? <Sidebar />}

      {/* PAGE CONTENT */}

      <div className="min-w-0 flex-1 bg-ui-bg pb-16 md:pb-0">
        {children}
      </div>

    </div>
  );
}