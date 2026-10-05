import Link from "next/link";
import { redirect } from "next/navigation";
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
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/db/entities";
import { logoutAdminAction } from "@/actions/auth-actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const isSuperadmin = session.role === UserRole.SUPERADMIN;

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] flex flex-col md:flex-row text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-arabic font-bold text-xl shadow-md shadow-emerald-950/20">
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Resource Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors"
              >
                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-6">
            <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              Public Interface
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>View Public Platform</span>
              </span>
            </Link>
          </div>
        </nav>

        {/* User Session Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090e1a]">
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

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-700 text-xs font-medium transition-colors border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:text-slate-300 dark:border-slate-700/60 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white/80 dark:bg-[#0b101b]/80 backdrop-blur-sm sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Arabiyyah Gateway • Connected to PostgreSQL 18
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle compact />

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Role:</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                {session.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-10 flex-1">{children}</main>
      </div>
    </div>
  );
}
