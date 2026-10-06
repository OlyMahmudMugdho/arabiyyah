"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  GraduationCap,
  Compass,
  BookOpen,
  FileText,
  Users,
  FolderKanban,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { UserRole } from "@/db/entities";
import { logoutAdminAction, changePasswordAction } from "@/actions/auth-actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SessionPayload } from "@/lib/auth";

interface AdminShellProps {
  session: SessionPayload;
  children: React.ReactNode;
}

export function AdminShell({ session, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isSuperadmin = session.role === UserRole.SUPERADMIN;

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePasswordAction(currentPassword, newPassword);
      if (res.error) {
        setPasswordError(res.error);
      } else {
        setPasswordSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPasswordSuccess(null);
        }, 1800);
      }
    } catch {
      setPasswordError("An unexpected error occurred.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Courses", href: "/admin/courses", icon: GraduationCap },
    { name: "Learning Paths", href: "/admin/paths", icon: Compass },
    { name: "Books", href: "/admin/books", icon: BookOpen },
    { name: "Notes & Guides", href: "/admin/notes", icon: FileText },
    { name: "Categories", href: "/admin/categories", icon: FolderKanban },
  ];

  if (isSuperadmin) {
    navItems.push({
      name: "Users & Permissions",
      href: "/admin/users",
      icon: Users,
    });
  }

  const isLinkActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header - Pinned at top of sidebar container */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between">
        <Link
          href="/admin"
          prefetch={true}
          onClick={() => isMobile && setMobileOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-arabic font-bold text-xl shadow-md shadow-emerald-950/20 shrink-0">
            ع
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 dark:text-white">Arabiyyah Admin</span>
              <span className="font-arabic text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                العربية
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              Administrative Workspace
            </span>
          </div>
        </Link>
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Container - Independent scroll container */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto min-h-0 overscroll-contain">
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 mb-2">
          Resource Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 mb-2">
            Public Interface
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>View Public Platform</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* User Session Footer - Pinned at bottom of sidebar container */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090e1a] shrink-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {session.name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {session.email}
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              isSuperadmin
                ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
            }`}
          >
            {session.role}
          </span>
        </div>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => {
              if (isMobile) setMobileOpen(false);
              setPasswordModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 hover:text-slate-900 text-slate-700 text-xs font-medium transition-colors border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700/60 shadow-2xs cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <span>Change Password</span>
          </button>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-700 text-xs font-medium transition-colors border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:text-slate-300 dark:border-slate-700/60 shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Desktop Fixed Left Sidebar - Pinned to Viewport */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 w-64 h-screen z-40 bg-white dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800 flex-col shrink-0"
        aria-label="Desktop Admin Sidebar"
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] h-screen z-50 bg-white dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800 flex flex-col md:hidden shadow-2xl transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-label="Mobile Admin Sidebar"
      >
        {renderSidebarContent(true)}
      </aside>

      {/* 3. Main Content Area with Left Padding for Fixed Sidebar */}
      <div className="md:pl-64 flex flex-col min-h-screen min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between bg-white/80 dark:bg-[#0b101b]/80 backdrop-blur-sm sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Arabiyyah Gateway • Connected to PostgreSQL 18
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle compact />

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Role:</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                {session.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 md:p-10 flex-1">{children}</main>
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Update credentials for {session.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? "Saving..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
