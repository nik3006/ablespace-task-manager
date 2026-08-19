"use client";

import Link from "next/link";
import {
  User,
  Sun,
  Moon,
  Palette,
  ArrowLeft,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

type Theme = "light" | "dark";

export default function ProfileSidebar() {
  const [theme, setTheme] =
    useState<Theme>("light");

  const [themeOpen, setThemeOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "theme",
      ) as Theme | null;

    const currentTheme =
      savedTheme === "dark"
        ? "dark"
        : "light";

    setTheme(currentTheme);

    document.documentElement.classList.toggle(
      "dark",
      currentTheme === "dark",
    );
  }, []);

  const changeTheme = (
    newTheme: Theme,
  ) => {
    setTheme(newTheme);

    localStorage.setItem(
      "theme",
      newTheme,
    );

    document.documentElement.classList.toggle(
      "dark",
      newTheme === "dark",
    );

    setThemeOpen(false);
  };

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const response = await apiFetch(
        "/auth/logout",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to logout",
        );
      }

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Logout error:",
        error,
      );

      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* =====================================
          MOBILE PROFILE NAVIGATION
      ===================================== */}

      <div className="relative z-50 w-full border-b border-ui-border bg-ui-surface md:hidden">

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-1
            px-3
            py-2
          "
        >

          {/* BACK TO APP */}

          <Link
            href="/"
            className="
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-md
              px-2.5
              py-2
              text-xs
              font-semibold
              text-ui-text
              transition
              hover:bg-ui-surface-muted
            "
          >
            <ArrowLeft
              size={14}
              strokeWidth={2.4}
            />

            Back to app
          </Link>

          {/* PROFILE */}

          <Link
            href="/profile"
            className="
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-md
              bg-ui-surface-muted
              px-2.5
              py-2
              text-xs
              font-semibold
              text-ui-text
            "
          >
            <User
              size={14}
              strokeWidth={2.2}
            />

            Profile
          </Link>

          {/* THEME */}

          <div className="relative shrink-0">

            <button
              type="button"
              onClick={() =>
                setThemeOpen(
                  (current) =>
                    !current,
                )
              }
              className="
                flex
                items-center
                gap-1.5
                rounded-md
                px-2.5
                py-2
                text-xs
                font-semibold
                text-ui-text
                transition
                hover:bg-ui-surface-muted
              "
            >

              {theme === "dark" ? (
                <Moon
                  size={14}
                  strokeWidth={2.2}
                />
              ) : (
                <Sun
                  size={14}
                  strokeWidth={2.2}
                />
              )}

              Theme

              <ChevronDown
                size={12}
                className={
                  themeOpen
                    ? "rotate-180 transition"
                    : "transition"
                }
              />

            </button>

            {/* THEME DROPDOWN */}

            {themeOpen && (
              <div
                className="
                  absolute
                  left-0
                  top-full
                  z-[100]
                  mt-1
                  w-28
                  overflow-hidden
                  rounded-md
                  border
                  border-ui-border
                  bg-ui-surface
                  shadow-xl
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    changeTheme("light")
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-2
                    px-3
                    py-2.5
                    text-left
                    text-xs
                    font-medium
                    text-ui-text
                    hover:bg-ui-surface-muted
                    ${
                      theme === "light"
                        ? "bg-ui-surface-muted"
                        : ""
                    }
                  `}
                >
                  <Sun size={14} />
                  Light
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeTheme("dark")
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-2
                    px-3
                    py-2.5
                    text-left
                    text-xs
                    font-medium
                    text-ui-text
                    hover:bg-ui-surface-muted
                    ${
                      theme === "dark"
                        ? "bg-ui-surface-muted"
                        : ""
                    }
                  `}
                >
                  <Moon size={14} />
                  Dark
                </button>

              </div>
            )}

          </div>

          {/* COLOR */}

          <button
            type="button"
            className="
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-md
              px-2.5
              py-2
              text-xs
              font-semibold
              text-ui-text
              transition
              hover:bg-ui-surface-muted
            "
          >
            <Palette
              size={14}
              strokeWidth={2.2}
            />

            Color
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-md
              border
              border-red-200
              bg-red-50
              px-2.5
              py-2
              text-xs
              font-semibold
              text-red-600
              transition
              hover:bg-red-100
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-red-900/50
              dark:bg-red-950/30
              dark:text-red-400
              dark:hover:bg-red-950/50
            "
          >
            <LogOut
              size={14}
              strokeWidth={2.2}
            />

            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>

        </div>

      </div>

      {/* =====================================
          TABLET / DESKTOP SIDEBAR
      ===================================== */}

      <aside
        className="
          hidden
          h-screen
          w-56
          shrink-0
          flex-col
          border-r
          border-ui-border
          bg-ui-surface
          md:flex
          lg:w-64
        "
      >

        <div className="min-h-0 flex-1 overflow-y-auto p-3">

          {/* BACK TO APP */}

          <Link
            href="/"
            className="
              flex
              items-center
              gap-2
              rounded-md
              px-3
              py-2
              text-sm
              font-semibold
              text-ui-text
              transition
              hover:bg-ui-surface-muted
            "
          >
            <ArrowLeft
              size={16}
              strokeWidth={2.4}
            />

            Back to app
          </Link>

          {/* NAVIGATION */}

          <nav className="mt-3 space-y-1">

            {/* PROFILE */}

            <Link
              href="/profile"
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-md
                bg-ui-surface-muted
                px-3
                py-2
                text-sm
                font-semibold
                text-ui-text
              "
            >
              <User
                size={16}
                strokeWidth={2.2}
              />

              Profile
            </Link>

            {/* THEME */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setThemeOpen(
                    (current) =>
                      !current,
                  )
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-md
                  px-3
                  py-2
                  text-left
                  text-sm
                  font-semibold
                  text-ui-text
                  transition
                  hover:bg-ui-surface-muted
                "
              >

                <span className="flex items-center gap-2">

                  {theme === "dark" ? (
                    <Moon size={16} />
                  ) : (
                    <Sun size={16} />
                  )}

                  Theme

                </span>

                <ChevronDown
                  size={14}
                  className={
                    themeOpen
                      ? "rotate-180 transition"
                      : "transition"
                  }
                />

              </button>

              {themeOpen && (
                <div
                  className="
                    relative
                    z-[100]
                    ml-3
                    mt-1
                    overflow-hidden
                    rounded-md
                    border
                    border-ui-border
                    bg-ui-surface
                    shadow-lg
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      changeTheme("light")
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      gap-2
                      px-3
                      py-2
                      text-left
                      text-xs
                      text-ui-text
                      hover:bg-ui-surface-muted
                      ${
                        theme === "light"
                          ? "bg-ui-surface-muted"
                          : ""
                      }
                    `}
                  >
                    <Sun size={14} />
                    Light
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeTheme("dark")
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      gap-2
                      px-3
                      py-2
                      text-left
                      text-xs
                      text-ui-text
                      hover:bg-ui-surface-muted
                      ${
                        theme === "dark"
                          ? "bg-ui-surface-muted"
                          : ""
                      }
                    `}
                  >
                    <Moon size={14} />
                    Dark
                  </button>

                </div>
              )}

            </div>

            {/* COLOR */}

            <button
              type="button"
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-md
                px-3
                py-2
                text-left
                text-sm
                font-semibold
                text-ui-text
                transition
                hover:bg-ui-surface-muted
              "
            >
              <Palette size={16} />

              Color
            </button>

          </nav>

        </div>

        {/* LOGOUT */}

        <div className="shrink-0 border-t border-ui-border p-3">

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-md
              border
              border-red-200
              bg-red-50
              px-3
              py-2.5
              text-sm
              font-semibold
              text-red-600
              transition
              hover:bg-red-100
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-red-900/50
              dark:bg-red-950/30
              dark:text-red-400
              dark:hover:bg-red-950/50
            "
          >
            <LogOut
              size={16}
              strokeWidth={2.2}
            />

            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>

        </div>

      </aside>
    </>
  );
}