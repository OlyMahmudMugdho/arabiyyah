"use client";

import { useTheme, type Theme } from "./ThemeProvider";
import { Sun, Moon, BookOpen, Monitor, ChevronDown, Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

interface ThemeOption {
  id: Theme;
  label: string;
  badge?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    description: "Clean daytime brightness",
    icon: Sun,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-950/40 text-amber-600",
  },
  {
    id: "sepia",
    label: "Sepia",
    badge: "Manuscript",
    description: "Warm parchment reading",
    icon: BookOpen,
    iconColor: "text-amber-800 dark:text-amber-400",
    iconBg: "bg-amber-200/60 dark:bg-amber-900/40 text-amber-800",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Night mode slate",
    icon: Moon,
    iconColor: "text-emerald-500 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600",
  },
  {
    id: "system",
    label: "System",
    description: "Sync with device setting",
    icon: Monitor,
    iconColor: "text-slate-500 dark:text-slate-400",
    iconBg: "bg-slate-200/70 dark:bg-slate-800 text-slate-600",
  },
];

export function ThemeToggle({ className = "", compact = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div
        className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 opacity-60 animate-pulse ${
          compact ? "w-14 h-9" : "w-24 h-9"
        } ${className}`}
      />
    );
  }

  const renderActiveIcon = () => {
    if (theme === "system") {
      return (
        <Monitor className="w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-200" />
      );
    }
    if (resolvedTheme === "light") {
      return (
        <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200" />
      );
    }
    if (resolvedTheme === "sepia") {
      return (
        <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-400 transition-transform duration-200" />
      );
    }
    return (
      <Moon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 transition-transform duration-200" />
    );
  };

  const getActiveLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "sepia":
        return "Sepia";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "Theme";
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Select theme appearance"
        className={`group relative flex items-center justify-between rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer ${
          compact ? "h-9 px-2.5 gap-1.5" : "h-9 px-3 gap-2"
        } bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/60 dark:text-slate-200 dark:hover:text-white sepia:bg-[#ede2cd] sepia:hover:bg-[#e4d3bc] sepia:border-[#dfd0b5] sepia:text-[#382b20] ${
          isOpen ? "ring-2 ring-emerald-500/40 border-emerald-500/40" : ""
        } ${className}`}
      >
        <div className="flex items-center gap-1.5">
          {renderActiveIcon()}
          {!compact && (
            <span className="text-xs font-semibold tracking-wide">
              {getActiveLabel()}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-400 sepia:text-[#7d6852] transition-transform duration-200 ${
            isOpen
              ? "rotate-180 text-emerald-600 dark:text-emerald-400"
              : "group-hover:text-slate-600 dark:group-hover:text-slate-300"
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-56 sm:w-60 rounded-2xl p-1.5 bg-white/95 dark:bg-[#0f172a]/95 sepia:bg-[#ede2cd] backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 sepia:border-[#dfd0b5] shadow-xl shadow-slate-900/10 dark:shadow-black/50 sepia:shadow-amber-950/15 z-50 animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
        >
          <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800/80 sepia:border-[#dfd0b5]/60 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 sepia:text-[#8a725b]">
              Theme
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 sepia:text-[#8a725b] capitalize">
              Active: {theme}
            </span>
          </div>

          <div className="space-y-0.5">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = theme === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors group cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-950 font-semibold dark:bg-emerald-500/15 dark:text-emerald-300 sepia:bg-[#dfd0b5]/70 sepia:text-[#382b20]"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white sepia:text-[#5a4738] sepia:hover:bg-[#e4d3bc]/80 sepia:hover:text-[#2a1f16]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${opt.iconBg}`}>
                      <Icon className={`w-3.5 h-3.5 ${opt.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-xs leading-none">
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-200/80 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 sepia:bg-[#cbb592] sepia:text-[#2b1f13] leading-tight">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 sepia:text-[#8a725b] truncate mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </div>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 sepia:text-amber-800 shrink-0 ml-2" />
                  ) : (
                    <span className="w-4 h-4 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
