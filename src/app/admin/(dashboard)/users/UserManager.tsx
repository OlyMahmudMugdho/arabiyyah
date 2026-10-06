"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Edit,
  Trash2,
  X,
  Check,
  Lock,
  RotateCcw,
  Copy,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { UserRole, AdminPermission } from "@/db/entities";
import {
  createAdminUserAction,
  updateAdminUserAction,
  deleteAdminUserAction,
  superadminResetUserPasswordAction,
} from "@/actions/user-actions";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
}

interface UserManagerProps {
  initialUsers: AdminUser[];
  currentUserId: string;
}

export function UserManager({ initialUsers, currentUserId }: UserManagerProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    AdminPermission.MANAGE_COURSES,
    AdminPermission.MANAGE_PATHS,
  ]);
  const [isActive, setIsActive] = useState(true);

  // Superadmin Reset Password states
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<AdminUser | null>(null);
  const [resetCustomPassword, setResetCustomPassword] = useState("");
  const [resetResultPassword, setResetResultPassword] = useState<string | null>(null);
  const [resetCopied, setResetCopied] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const openResetModal = (user: AdminUser) => {
    setResetTargetUser(user);
    setResetCustomPassword("");
    setResetResultPassword(null);
    setResetCopied(false);
    setResetError(null);
    setResetModalOpen(true);
  };

  const handleSuperadminReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResetLoading(true);
    setResetError(null);

    try {
      const res = await superadminResetUserPasswordAction(
        resetTargetUser.id,
        resetCustomPassword || undefined
      );

      if (res.error) {
        setResetError(res.error);
      } else if (res.newPassword) {
        setResetResultPassword(res.newPassword);
      }
    } catch {
      setResetError("Failed to reset password. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyNewPassword = () => {
    if (!resetResultPassword) return;
    navigator.clipboard.writeText(resetResultPassword);
    setResetCopied(true);
    setTimeout(() => setResetCopied(false), 2000);
  };

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

  const openCreateModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole(UserRole.ADMIN);
    setSelectedPermissions([
      AdminPermission.MANAGE_COURSES,
      AdminPermission.MANAGE_PATHS,
      AdminPermission.MANAGE_BOOKS,
      AdminPermission.MANAGE_NOTES,
    ]);
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setSelectedPermissions(u.permissions || []);
    setIsActive(u.isActive);
    setError(null);
    setModalOpen(true);
  };

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

    if (editingUser) {
      const res = await updateAdminUserAction(editingUser.id, {
        name,
        email,
        role,
        permissions: selectedPermissions,
        isActive,
        password: password.trim() ? password : undefined,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setUsers(
          users.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  name,
                  email,
                  role,
                  permissions: selectedPermissions,
                  isActive,
                }
              : u
          )
        );
        setModalOpen(false);
        setLoading(false);
      }
    } else {
      if (!password) {
        setError("Password is required for new users.");
        setLoading(false);
        return;
      }

      const res = await createAdminUserAction({
        name,
        email,
        password,
        role,
        permissions: selectedPermissions,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.user) {
        setUsers([
          ...users,
          {
            ...(res.user as any),
            createdAt: new Date(),
          },
        ]);
        setModalOpen(false);
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete admin user "${name}"?`))
      return;

    const res = await deleteAdminUserAction(id);
    if (res.error) {
      alert(res.error);
    } else {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Superadmin Restricted Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            <span>Administrators & Permissions</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Only Superadmins can invite new curators and delegate role permissions. Public registration is permanently closed.
          </p>
        </div>

        <Link
          href="/admin/users/new"
          prefetch={true}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-950/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New Admin</span>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Assigned Permissions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                const isSuper = u.role === UserRole.SUPERADMIN;

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">{u.email}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isSuper
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isSuper ? (
                        <span className="text-xs text-amber-700 dark:text-amber-300/90 font-medium">
                          Full Superadmin Authorization (All Permissions)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {u.permissions && u.permissions.length > 0 ? (
                            u.permissions.map((perm) => (
                              <span
                                key={perm}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px]"
                              >
                                {perm.replace("manage_", "")}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              No permissions assigned
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.isActive
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => openResetModal(u)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 dark:bg-slate-800 dark:hover:bg-amber-950/60 dark:text-slate-300 dark:hover:text-amber-300 transition-colors"
                        title="Reset User Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors"
                        title="Edit Permissions"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {!isSelf && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-300 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span>
                  {editingUser ? "Edit Admin & Permissions" : "Add New Admin User"}
                </span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shaykh Zayd"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@arabiyyah.org"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Password {editingUser ? "(Leave blank to keep)" : "*"}</span>
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? "••••••••" : "Enter password"}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value={UserRole.ADMIN}>ADMIN (Custom Permissions)</option>
                    <option value={UserRole.SUPERADMIN}>SUPERADMIN (Full Access)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Assign Granular Permissions:
                </label>

                {role === UserRole.SUPERADMIN ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                    Superadmins implicitly possess all permissions across courses, paths, books, notes, and user accounts.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allAvailablePermissions.map((perm) => {
                      const checked = selectedPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => togglePermission(perm.key)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                            checked
                              ? "bg-amber-50/60 border-amber-500/40 text-slate-900 dark:bg-slate-800/80 dark:border-emerald-500/40 dark:text-white"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                              {perm.label}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {perm.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              {editingUser && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isActive" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Account is Active
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs disabled:opacity-50 transition-colors shadow-md shadow-amber-950/20"
                >
                  {loading ? "Saving..." : editingUser ? "Update User" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Superadmin Reset Password Modal */}
      {resetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Reset User Password
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Administrator: {resetTargetUser.name} ({resetTargetUser.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetResultPassword ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Password Reset Successfully!</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Please securely share this new credential with {resetTargetUser.name}.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-wider select-all">
                    {resetResultPassword}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNewPassword}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                  >
                    {resetCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSuperadminReset} className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  As Superadmin, you can assign a custom password below, or leave it blank to automatically generate a secure 8+ character password.
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Custom New Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={resetCustomPassword}
                    onChange={(e) => setResetCustomPassword(e.target.value)}
                    placeholder="Leave blank for auto-generated password"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white text-xs focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white dark:text-slate-950 font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
