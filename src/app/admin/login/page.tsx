"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldAlert, ArrowRight, KeyRound, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const res = await response.json();

      if (!response.ok || res.error) {
        setError(res.error || "Login failed");
        setLoading(false);
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Network error occurred during login. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b13] bg-arabesque p-4 relative transition-colors duration-200">
      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="rounded-3xl bg-white/95 border border-slate-200 shadow-2xl dark:bg-[#0f172a]/95 dark:border-slate-800 dark:shadow-black/80 p-8 space-y-6 transition-colors">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-950/20">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="pt-2">
              <span className="font-arabic text-emerald-600 dark:text-emerald-400 text-lg font-bold">
                لوحة التحكم الإدارية • العربية
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Arabiyyah Admin Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Restricted gateway for Arabiyyah curators and administrators.
              </p>
            </div>
          </div>

          {/* Alert box indicating no public signup */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-400 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Private Access Only</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Public registration is disabled. Only authorized administrators created by the Superadmin can sign in.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@arabiyyah.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Pre-seeded credentials helper for convenience */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Superadmin: </span>
              <strong className="text-emerald-700 dark:text-emerald-400">superadmin@arabiyyah.org</strong>
              <span className="text-slate-400">(or @bayan.org)</span>
              <span> / </span>
              <strong className="text-emerald-700 dark:text-emerald-400">SuperAdmin123!</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
