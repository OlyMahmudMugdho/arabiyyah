"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className = "", compact = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 opacity-60 animate-pulse ${className}`}
      />
    );
  }

  const getLabelAndTitle = () => {
    switch (resolvedTheme) {
      case "light":
        return {
          title: "Theme: Light (Click for Sepia Reading Mode)",
          label: "Switch to sepia reading mode",
        };
      case "sepia":
        return {
          title: "Theme: Sepia Manuscript (Click for Dark Night Mode)",
          label: "Switch to dark theme",
        };
      case "dark":
      default:
        return {
          title: "Theme: Dark Night (Click for Light Daytime Mode)",
          label: "Switch to light theme",
        };
    }
  };

  const { title, label } = getLabelAndTitle();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={title}
      className={`group relative flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
        compact ? "w-8 h-8 p-1.5" : "w-9 h-9 p-2"
      } bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/60 dark:text-slate-200 dark:hover:text-white ${className}`}
    >
      {resolvedTheme === "light" && (
        <Sun className="w-4 h-4 text-amber-500 group-hover:text-amber-600 transition-transform duration-300 group-hover:rotate-45" />
      )}
      {resolvedTheme === "sepia" && (
        <BookOpen className="w-4 h-4 text-amber-800 transition-transform duration-300 group-hover:scale-110" />
      )}
      {resolvedTheme === "dark" && (
        <Moon className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
