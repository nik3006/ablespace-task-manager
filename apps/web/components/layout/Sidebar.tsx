"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { GalleryVerticalEnd } from "lucide-react";
import {
  HugeiconsIcon,
} from "@hugeicons/react";
import {
  DashboardSquare03Icon,
} from "@hugeicons/core-free-icons";

import { API_BASE_URL } from "@/lib/api";

type User = {
  id: string;
  fullName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
};

const navItems = [
  {
    href: "/",
    label: "Tasks",
    icon: "tasks",
  },
  {
    href: "/projects",
    label: "Projects",
    icon: "projects",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/me`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setUser(data);
      } catch (error) {
        console.error(
          "Failed to load user:",
          error,
        );
      }
    };

    loadUser();
  }, []);

  const userName =
    user?.fullName ||
    user?.username ||
    "User";

  const userInitial = userName
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* =====================================================
          DESKTOP / TABLET SIDEBAR
          ===================================================== */}

      <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-ui-border bg-ui-surface md:flex">

        {/* TOP SECTION */}

        <div className="p-4">

          {/* LOGGED-IN USER */}

          <div className="mb-7 flex items-center justify-between">

            <Link
              href="/profile"
              className="flex min-w-0 items-center gap-2"
            >

              {/* PROFILE AVATAR */}

              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={userName}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white">
                  {userInitial}
                </div>
              )}

              {/* USERNAME */}

              <span className="truncate text-sm font-semibold text-ui-text">
                {userName}
              </span>

            </Link>

            <span className="shrink-0 text-xs font-bold text-ui-text">
              ↕
            </span>

          </div>

          {/* WORKSPACE */}

          <div className="mb-2 flex items-center justify-between px-2">

            <span className="text-sm font-semibold text-ui-text">
              Workspace
            </span>

            <span className="text-xs font-medium text-ui-text-secondary">
              ⌄
            </span>

          </div>

          {/* NAVIGATION */}

          <nav className="space-y-1">

            {navItems.map((item) => {

              const isActive =
                pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-ui-surface-muted text-ui-text"
                      : "text-ui-text-secondary hover:bg-ui-surface-muted"
                  }`}
                >

                  {/* ICON */}

                  <span className="flex w-5 shrink-0 items-center text-ui-text">

                    {item.icon ===
                      "tasks" && (
                      <HugeiconsIcon
                        icon={
                          DashboardSquare03Icon
                        }
                        size={16}
                        strokeWidth={1.8}
                      />
                    )}

                    {item.icon ===
                      "projects" && (
                      <GalleryVerticalEnd
                        size={17}
                        strokeWidth={1.8}
                      />
                    )}

                  </span>

                  {/* LABEL */}

                  <span className="ml-2">
                    {item.label}
                  </span>

                </Link>
              );
            })}

          </nav>

        </div>

      </aside>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
          ===================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-ui-border bg-ui-surface md:hidden">

        {/* PROFILE */}

        <Link
          href="/profile"
          className={`flex min-w-16 flex-col items-center justify-center gap-1 ${
            pathname === "/profile"
              ? "text-ui-text"
              : "text-ui-text-secondary"
          }`}
        >

          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={userName}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[10px] font-medium text-white">
              {userInitial}
            </div>
          )}

          <span className="text-[10px] font-semibold">
            Profile
          </span>

        </Link>

        {/* TASKS */}

        <Link
          href="/"
          className={`flex min-w-16 flex-col items-center justify-center gap-1 rounded-md ${
            pathname === "/"
              ? "text-ui-text"
              : "text-ui-text-secondary"
          }`}
        >

          <HugeiconsIcon
            icon={DashboardSquare03Icon}
            size={18}
            strokeWidth={1.8}
          />

          <span className="text-[10px] font-semibold">
            Tasks
          </span>

        </Link>

        {/* PROJECTS */}

        <Link
          href="/projects"
          className={`flex min-w-16 flex-col items-center justify-center gap-1 ${
            pathname === "/projects"
              ? "text-ui-text"
              : "text-ui-text-secondary"
          }`}
        >

          <GalleryVerticalEnd
            size={18}
            strokeWidth={1.8}
          />

          <span className="text-[10px] font-semibold">
            Projects
          </span>

        </Link>

      </nav>
    </>
  );
}