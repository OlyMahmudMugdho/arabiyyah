"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  requestPasswordResetAction,
  resetPasswordWithOtpAction,
} from "@/actions/auth-actions";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step state: 1 = Enter Email, 2 = Enter OTP & New Password
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Request & Verify states
  const [requestLoading, setRequestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isSmtpConfigured, setIsSmtpConfigured] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 1: Send OTP to email
  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setRequestLoading(true);

    try {
      const res = await requestPasswordResetAction(email);
      if (res.error) {
        setError(res.error);
      } else {
        setInfoMessage(res.message || null);
        setDevOtp(res.devOtp || null);
        setIsSmtpConfigured(Boolean(res.isSmtpConfigured));
        setStep(2);
        startCooldown();
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  }

  function startCooldown() {
    setResendCooldown(45);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Resend OTP
  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setError(null);
    setRequestLoading(true);

    try {
      const res = await requestPasswordResetAction(email);
      if (res.error) {
        setError(res.error);
      } else {
        setInfoMessage(res.message || null);
        setDevOtp(res.devOtp || null);
        startCooldown();
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  }

  // Step 2: Verify OTP and save new password
  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setResetLoading(true);

    try {
      const res = await resetPasswordWithOtpAction(email, cleanOtp, newPassword);
      if (res.error) {
        setError(res.error);
        setResetLoading(false);
      } else {
        // Successfully reset password! Redirect to login page
        router.push("/admin/login?reset=success");
      }
    } catch {
      setError("Failed to reset password. Please try again.");
      setResetLoading(false);
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
        <div className="rounded-3xl bg-white/95 border border-slate-200 shadow-2xl dark:bg-[#0f172a]/95 dark:border-slate-800 dark:shadow-black/80 p-8 space-y-6 transition-colors">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-950/20">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="pt-2">
              <span className="font-arabic text-emerald-600 dark:text-emerald-400 text-lg font-bold">
                استعادة كلمة المرور • رمز التحقق
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {step === 1 ? "Reset Password" : "Verify OTP Code"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {step === 1
                  ? "Enter your registered admin email to receive a 6-digit verification code."
                  : `Verification code dispatched to ${email}`}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@arabiyyah.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  A 6-digit one-time verification code valid for 15 minutes will be dispatched via SMTP.
                </p>
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {requestLoading ? (
                  <span>Sending Verification Code...</span>
                ) : (
                  <>
                    <span>Send Verification Code (OTP)</span>
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
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification & New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Dev mode / local testing badge */}
              {devOtp && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Development OTP:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtp(devOtp)}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white hover:bg-amber-500 transition-colors cursor-pointer"
                    >
                      Fill Code
                    </button>
                  </div>
                  <div className="font-mono text-base font-extrabold tracking-widest text-amber-700 dark:text-amber-200">
                    {devOtp}
                  </div>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                    {!isSmtpConfigured
                      ? "SMTP credentials are not yet set in .env. Enter SMTP_HOST, SMTP_PORT, and SMTP_PASSWORD in .env for production email dispatch."
                      : "Verification code sent to your email inbox."}
                  </p>
                </div>
              )}

              {infoMessage && !devOtp && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {/* 6-Digit OTP Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || requestLoading}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-300 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Confirm New Password */}
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

              {/* Verification checks */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    newPassword.length >= 8
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      newPassword.length >= 8 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                  <span>At least 8 characters long</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    newPassword && confirmPassword && newPassword === confirmPassword
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      newPassword && confirmPassword && newPassword === confirmPassword
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                  <span>Passwords match</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  resetLoading ||
                  otp.length !== 6 ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {resetLoading ? (
                  <span>Verifying & Updating...</span>
                ) : (
                  <>
                    <span>Verify Code & Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email</span>
                </button>
                <Link
                  href="/admin/login"
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
