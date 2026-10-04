"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Compass, FileText, GraduationCap, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Learning Paths", href: "/paths", icon: Compass },
    { name: "Courses", href: "/courses", icon: GraduationCap },
    { name: "Books", href: "/books", icon: BookOpen },
    { name: "Notes & Guides", href: "/notes", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200 dark:bg-[#0b101b]/85 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <span className="font-arabic font-bold text-2xl leading-none">ع</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Arabiyyah
                </span>
                <span className="font-arabic text-emerald-600 dark:text-emerald-400 text-lg font-bold">
                  العربية
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Arabic Learning Resources
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/paths"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 transition-all hover:shadow-emerald-900/40"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Paths</span>
            </Link>
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-[#0e1422] px-4 pt-3 pb-5 space-y-2 backdrop-blur-md">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-emerald-400 transition-colors"
              >
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/paths"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Paths</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
