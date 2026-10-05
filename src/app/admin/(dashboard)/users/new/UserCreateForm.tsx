"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { UserRole, AdminPermission } from "@/db/entities";
import { createAdminUserAction } from "@/actions/user-actions";

export function UserCreateForm() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    AdminPermission.MANAGE_COURSES,
    AdminPermission.MANAGE_PATHS,
    AdminPermission.MANAGE_BOOKS,
    AdminPermission.MANAGE_NOTES,
  ]);
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAvailablePermissions = [
    {
      key: AdminPermission.MANAGE_COURSES,
      label: "Manage Courses",
      description: "Create, edit, and publish video lectures and syllabus data",
    },
    {
      key: AdminPermission.MANAGE_PATHS,
      label: "Manage Learning Paths",
      description: "Structure sequential stages and combine courses into tracks",
    },
    {
      key: AdminPermission.MANAGE_BOOKS,
      label: "Manage Books Library",
      description: "Upload and curate classical primers and textbooks",
    },
    {
      key: AdminPermission.MANAGE_NOTES,
      label: "Manage Study Notes",
      description: "Publish grammar matrices, cheat sheets, and mindmaps",
    },
    {
      key: AdminPermission.MANAGE_USERS,
      label: "Manage Admin Users",
      description: "Create new administrators and delegate system permissions",
    },
  ];

  const togglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await createAdminUserAction({
        name,
        email,
        password,
        role,
        permissions:
          role === UserRole.SUPERADMIN
            ? Object.values(AdminPermission)
            : selectedPermissions,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.user) {
        router.push("/admin/users");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create administrator.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back link */}
      <div>
        <Link
          href="/admin/users"
          prefetch={true}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Administrators</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Superadmin Restricted Action</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              <span>Provision New Administrator</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create a trusted staff account and assign specific administrative privileges.
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs transition-colors"
      >
        {/* Full Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Zayd ibn Haritha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="curator@arabiyyah.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Initial Password & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Initial Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Must be at least 6 characters. The curator can change it upon login.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              System Role Hierarchy <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value={UserRole.ADMIN}>Admin (Delegated Permissions)</option>
              <option value={UserRole.SUPERADMIN}>Superadmin (Unrestricted Root Access)</option>
            </select>
          </div>
        </div>

        {/* Granular Permissions (Only for Admin role) */}
        {role === UserRole.ADMIN && (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Granular Resource Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allAvailablePermissions.map((perm) => {
                const isChecked = selectedPermissions.includes(perm.key);
                return (
                  <button
                    type="button"
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isChecked
                        ? "border-amber-500/50 bg-amber-500/10 text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        isChecked
                          ? "bg-amber-500 border-amber-500 text-white dark:text-slate-950"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{perm.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {perm.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Superadmin notice if superadmin selected */}
        {role === UserRole.SUPERADMIN && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>
              Superadmins automatically inherit all permissions across courses, paths, books, notes, categories, and administrator provisioning.
            </span>
          </div>
        )}

        {/* Active Status */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <input
            type="checkbox"
            id="userIsActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
          />
          <div>
            <label
              htmlFor="userIsActive"
              className="text-xs font-bold text-slate-900 dark:text-white block cursor-pointer"
            >
              Account Active Immediately
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              When checked, this user can log into the administration portal right away.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/users"
            prefetch={true}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-white dark:text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-950/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Admin...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Provision Administrator</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
