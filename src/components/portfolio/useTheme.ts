"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/themeKey";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_KEY = THEME_STORAGE_KEY;
/** Must match the SSR default on `<html className="dark">` in layout.tsx */
const DEFAULT_THEME: Theme = "dark";

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "system" ? saved : "dark";
  } catch {
    return DEFAULT_THEME;
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("system-theme", theme === "system");
  if (theme !== "light") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  // Clear any leftover inline styles from older theme code
  document.body.style.backgroundColor = "";
}

export function useTheme() {
  // Same default on server and client's first render — never read
  // localStorage/DOM here or hydration will mismatch for light-mode users.
  // The blocking layout script already applied the correct DOM class before paint.
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readTheme();
    setTheme(saved);
    applyTheme(saved);
    document.documentElement.classList.add("theme-ready");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore quota / private mode
    }
    applyTheme(theme);
  }, [theme, ready]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "dark" ? "light" : prev === "light" ? "system" : "dark",
    );
  };

  const resolvedTheme: ResolvedTheme = theme === "light" ? "light" : "dark";

  return { theme, resolvedTheme, setTheme, toggleTheme, ready };
}
