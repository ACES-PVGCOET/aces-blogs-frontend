"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("aces-theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const activeDark = stored === "dark" || (!stored && systemPrefersDark);
    setIsDark(activeDark);
    if (activeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("aces-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("aces-theme", "light");
    }
  }

  if (!mounted) {
    return (
      <div className="h-9 w-24 rounded-lg border border-stone-200 bg-stone-100 opacity-50 dark:border-stone-800 dark:bg-stone-900" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 font-editorial text-xs font-bold uppercase tracking-[0.16em] text-stone-800 transition hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
    >
      {isDark ? (
        <>
          <svg
            className="h-3.5 w-3.5 text-amber-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span>Light</span>
        </>
      ) : (
        <>
          <svg
            className="h-3.5 w-3.5 text-stone-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span>Dark</span>
        </>
      )}
    </button>
  );
}
