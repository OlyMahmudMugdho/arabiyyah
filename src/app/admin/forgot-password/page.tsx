"use client";

import { useState, useRef, useEffect } from "react";
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
  Sparkles,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ForgotPasswordPage() {
  // Step state: 1 = Email, 2 = Verify OTP, 3 = New Password (only after OTP verified)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form inputs
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & loading states
  const [requestLoading, setRequestLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isSmtpConfigured, setIsSmtpConfigured] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus OTP input on Step 2
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Auto-focus Password input on Step 3
  useEffect(() => {
    if (step === 3 && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [step]);

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

  // STEP 1: Send OTP to email
  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your administrative email address.");
      return;
    }

    setRequestLoading(true);

    try {
      const response = await fetch("/api/admin/request-password-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const res = await response.json();

      if (!response.ok || res.error) {
        setError(res.error || "Failed to dispatch verification code.");
      } else {
        setEmail(cleanEmail);
        setInfoMessage(res.message);
        setDevOtp(res.devOtp || null);
        setIsSmtpConfigured(Boolean(res.isSmtpConfigured));
        setStep(2);
        startCooldown();
      }
    } catch {
      setError("Network error occurred. Please check your connection and try again.");
    } finally {
      setRequestLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    if (resendCooldown > 0 || requestLoading) return;
    setError(null);
    setRequestLoading(true);

    try {
      const response = await fetch("/api/admin/request-password-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const res = await response.json();
      if (!response.ok || res.error) {
        setError(res.error || "Failed to resend code.");
      } else {
        setInfoMessage(res.message);
        setDevOtp(res.devOtp || null);
        startCooldown();
      }
    } catch {
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  }

  // STEP 2: Verify OTP
  async function handleVerifyOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (!cleanOtp) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    if (cleanOtp.length !== 6) {
      setError(`Verification code must be 6 digits (currently ${cleanOtp.length} digits entered).`);
      return;
    }

    setVerifyLoading(true);

    try {
      const response = await fetch("/api/admin/verify-password-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
        }),
      });

      const res = await response.json();

      if (!response.ok || res.error) {
        setError(res.error || "Invalid or expired verification code.");
      } else {
        setVerifiedToken(res.token || null);
        setStep(3); // Progress to Step 3: New Password Form!
      }
    } catch {
      setError("A network error occurred while verifying the code. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  }

  // STEP 3: Submit New Password
  async function handleSaveNewPassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (!confirmPassword) {
      setError("Please re-enter your new password in the confirm field.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify that both fields are identical.");
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch("/api/admin/reset-password-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim().replace(/\D/g, ""),
          token: verifiedToken,
          newPassword,
        }),
      });

      const res = await response.json();

      if (!response.ok || res.error) {
        setError(res.error || "Failed to update password. Please try again.");
        setResetLoading(false);
      } else {
        setResetSuccess(true);
        setTimeout(() => {
          window.location.href = "/admin/login?reset=success";
        }, 1200);
      }
    } catch {
      setError("A network error occurred while updating your password. Please try again.");
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
                {step === 1 && "استعادة كلمة المرور • البريد الإلكتروني"}
                {step === 2 && "التحقق من رمز التأكيد • OTP"}
                {step === 3 && "تعيين كلمة المرور الجديدة"}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {step === 1 && "Reset Password"}
                {step === 2 && "Verify Code"}
                {step === 3 && "Create New Password"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {step === 1 &&
                  "Enter your registered admin email to receive a 6-digit verification code."}
                {step === 2 &&
                  `Enter the 6-digit code sent to ${email} to proceed.`}
                {step === 3 &&
                  "Choose a secure new password for your administrator account."}
              </p>
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          {!resetSuccess && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                  step >= 1
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                1
              </div>
              <div
                className={`w-8 h-0.5 transition-colors ${
                  step >= 2 ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                  step >= 2
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                2
              </div>
              <div
                className={`w-8 h-0.5 transition-colors ${
                  step >= 3 ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                  step >= 3
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                3
              </div>
            </div>
          )}

          {/* Reset Success Screen */}
          {resetSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300 text-center space-y-2 py-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold">Password Reset Successfully!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Redirecting you to the Arabiyyah Admin Sign In portal...
              </p>
            </div>
          )}

          {/* Error Message */}
          {!resetSuccess && error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Email Form */}
          {!resetSuccess && step === 1 && (
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
                  A 6-digit verification code valid for 15 minutes will be dispatched via email.
                </p>
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {requestLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
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

          {/* STEP 2: Verify OTP Only */}
          {!resetSuccess && step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                      ? "SMTP credentials not yet configured. Code shown for developer testing."
                      : "Code successfully sent to your email inbox."}
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
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-300 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={verifyLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
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

          {/* STEP 3: Create New Password (ONLY SHOWN AFTER OTP IS VERIFIED) */}
          {!resetSuccess && step === 3 && (
            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              {/* Verified Badge */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verification code confirmed for: <strong>{email}</strong></span>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={passwordInputRef}
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
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

              {/* Requirement Helper indicators */}
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
                disabled={resetLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving New Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
