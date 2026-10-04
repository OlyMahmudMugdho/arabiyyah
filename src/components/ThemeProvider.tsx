"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "sepia" | "dark" | "system";
export type ResolvedTheme = "light" | "sepia" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = (localStorage.getItem("arabiyyah_theme") ||
        localStorage.getItem("bayan_theme")) as Theme | null;
      if (
        stored &&
        (stored === "light" ||
          stored === "sepia" ||
          stored === "dark" ||
          stored === "system")
      ) {
        setThemeState(stored);
      } else {
        setThemeState("dark");
      }
    } catch {
      // Ignore localStorage read errors in restricted contexts
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    const resolveCurrentTheme = (targetTheme: Theme): ResolvedTheme => {
      if (targetTheme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return targetTheme;
    };

    const currentResolved = resolveCurrentTheme(theme);
    setResolvedTheme(currentResolved);

    // Synchronize HTML classes and data-theme attribute
    root.classList.remove("dark", "sepia");
    if (currentResolved === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else if (currentResolved === "sepia") {
      root.classList.add("sepia");
      root.setAttribute("data-theme", "sepia");
    } else {
      root.setAttribute("data-theme", "light");
    }

    try {
      localStorage.setItem("arabiyyah_theme", theme);
      localStorage.setItem("bayan_theme", theme);
    } catch {
      // Ignore write errors
    }

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        const newResolved: ResolvedTheme = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        root.classList.remove("dark", "sepia");
        if (newResolved === "dark") {
          root.classList.add("dark");
          root.setAttribute("data-theme", "dark");
        } else {
          root.setAttribute("data-theme", "light");
        }
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      // Cycle: light -> sepia -> dark -> light
      const current = resolvedTheme;
      if (current === "light") return "sepia";
      if (current === "sepia") return "dark";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
