"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  validateResetTokenAction,
  resetPasswordWithTokenAction,
} from "@/actions/auth-actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      checkToken(tokenFromUrl);
    } else {
      setValidating(false);
      setTokenValid(false);
      setTokenError("No password reset token was provided in the URL.");
    }
  }, [tokenFromUrl]);

  async function checkToken(testToken: string) {
    setValidating(true);
    setTokenError(null);
    try {
      const res = await validateResetTokenAction(testToken);
      if (res.valid) {
        setTokenValid(true);
        setAccountEmail(res.email || "");
      } else {
        setTokenValid(false);
        setTokenError(res.error || "Reset token is invalid or expired.");
      }
    } catch {
      setTokenValid(false);
      setTokenError("Unable to verify reset token. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match. Please re-check.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPasswordWithTokenAction(token, password);
      if (res.error) {
        setFormError(res.error);
        setSubmitting(false);
      } else {
        // Redirect to login page with success notice
        router.push("/admin/login?reset=success");
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="rounded-3xl bg-white/95 border border-slate-200 shadow-2xl dark:bg-[#0f172a]/95 dark:border-slate-800 dark:shadow-black/80 p-8 space-y-6 transition-colors">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-950/20">
            <KeyRound className="w-7 h-7" />
          </div>

          <div className="pt-2">
            <span className="font-arabic text-emerald-600 dark:text-emerald-400 text-lg font-bold">
              تعيين كلمة المرور الجديدة
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Choose a strong password to secure your administrator account.
            </p>
          </div>
        </div>

        {/* Validating State */}
        {validating && (
          <div className="py-8 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Validating security token...
            </p>
          </div>
        )}

        {/* Invalid Token State */}
        {!validating && !tokenValid && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Invalid or Expired Link</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {tokenError ||
                  "The password reset link has expired, was already used, or is malformed."}
              </p>
            </div>

            {/* Option to manual token check if user wants to paste token */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Have a reset token code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste reset token here..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => checkToken(token)}
                  disabled={!token.trim()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white dark:bg-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <Link
                href="/admin/forgot-password"
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Request New Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/login"
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Valid Token - New Password Form */}
        {!validating && tokenValid && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {accountEmail && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">
                  Resetting credentials for: <strong>{accountEmail}</strong>
                </span>
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Requirement Helpers */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px]">
              <div
                className={`flex items-center gap-1.5 ${
                  password.length >= 8
                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    password.length >= 8 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
                <span>At least 8 characters long</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  password && confirmPassword && password === confirmPassword
                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    password && confirmPassword && password === confirmPassword
                      ? "bg-emerald-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
                <span>Passwords match</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || password.length < 8 || password !== confirmPassword}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Save New Password & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel and Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b13] bg-arabesque p-4 relative transition-colors duration-200">
      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-3xl bg-white/50 dark:bg-[#0f172a]/50 animate-pulse border border-slate-200 dark:border-slate-800" />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
