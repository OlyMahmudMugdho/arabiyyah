"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getUserRepository } from "@/db/data-source";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
} from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import { sendPasswordResetOtpEmail, isSmtpConfigured } from "@/lib/mailer";

export async function loginAdminAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    const userRepo = await getUserRepository();

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      return { error: "Invalid credentials." };
    }

    if (!user.isActive) {
      return { error: "Your account is disabled. Contact superadmin." };
    }

    let isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid && password.trim() !== password) {
      isValid = await bcrypt.compare(password.trim(), user.passwordHash);
    }
    if (!isValid) {
      return { error: "Invalid credentials." };
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
    });

    await setSessionCookie(token);

    await logActivity({
      action: "admin_login",
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      details: { role: user.role, method: "server_action" },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Login error:", err);
    return { error: "An unexpected error occurred during login." };
  }
}

export async function logoutAdminAction() {
  const session = await getSession();
  if (session) {
    await logActivity({
      action: "admin_logout",
      userId: session.userId,
      userName: session.name,
      userEmail: session.email,
      details: { role: session.role },
    });
  }
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function getSessionAction() {
  return await getSession();
}

export async function requestPasswordResetAction(rawEmail: string) {
  const email = rawEmail?.trim().toLowerCase();
  if (!email) {
    return { error: "Please provide a valid email address." };
  }

  try {
    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({ where: { email } });

    if (!user || !user.isActive) {
      // Don't leak whether an account exists for inactive/nonexistent emails
      return {
        success: true,
        message:
          "If an authorized administrator account exists with this email, a verification code has been dispatched.",
      };
    }

    // Generate 6-digit numeric OTP for email verification
    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();

    // Also generate secure hex token for direct URL fallback
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    user.resetPasswordOtp = otp;
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiresAt;
    await userRepo.save(user);

    // Send email via configured SMTP (or log in dev mode)
    const emailResult = await sendPasswordResetOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      expiresInMinutes: 15,
    });

    await logActivity({
      action: "password_reset_otp_request",
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      details: {
        email,
        emailSent: emailResult.sent,
        expiresAt: expiresAt.toISOString(),
      },
    });

    const resetUrl = `/admin/reset-password?token=${token}`;

    return {
      success: true,
      email: user.email,
      resetToken: token,
      resetUrl,
      otpSent: emailResult.sent,
      devOtp: emailResult.devOtp,
      isSmtpConfigured: isSmtpConfigured(),
      message: emailResult.message,
    };
  } catch (err: unknown) {
    console.error("Password reset OTP request error:", err);
    return {
      error: "An unexpected error occurred while processing your request.",
    };
  }
}

export async function verifyResetOtpAction(rawEmail: string, rawOtp: string) {
  const email = rawEmail?.trim().toLowerCase();
  const otp = rawOtp?.trim();

  if (!email || !otp) {
    return { valid: false, error: "Please provide both email and 6-digit OTP code." };
  }

  try {
    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({
      where: { email, resetPasswordOtp: otp, isActive: true },
    });

    if (!user || !user.resetPasswordExpires) {
      return {
        valid: false,
        error: "Invalid verification code or email address. Please check and try again.",
      };
    }

    if (new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return {
        valid: false,
        error: "Verification code has expired (15-minute validity limit). Please request a new code.",
      };
    }

    return {
      valid: true,
      email: user.email,
      name: user.name,
      resetToken: user.resetPasswordToken,
    };
  } catch (err: unknown) {
    console.error("Verify OTP error:", err);
    return { valid: false, error: "Failed to verify OTP code. Please try again." };
  }
}

export async function resetPasswordWithOtpAction(
  rawEmail: string,
  rawOtp: string,
  newPassword: string
) {
  const email = rawEmail?.trim().toLowerCase();
  const otp = rawOtp?.trim();

  if (!email || !otp) {
    return { error: "Email and verification code are required." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long." };
  }

  try {
    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({
      where: { email, resetPasswordOtp: otp, isActive: true },
    });

    if (!user || !user.resetPasswordExpires) {
      return {
        error: "Invalid verification code. Please request a new one.",
      };
    }

    if (new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return {
        error: "Verification code has expired. Please request a new one.",
      };
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetPasswordOtp = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await userRepo.save(user);

    await logActivity({
      action: "password_reset_otp_complete",
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      details: { email: user.email },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Reset password with OTP error:", err);
    return { error: "Failed to reset password. Please try again." };
  }
}

export async function validateResetTokenAction(token: string) {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return { valid: false, error: "Password reset token is missing." };
  }

  try {
    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({
      where: { resetPasswordToken: token.trim(), isActive: true },
    });

    if (!user || !user.resetPasswordExpires) {
      return {
        valid: false,
        error:
          "This password reset link is invalid or has already been used. Please request a new one.",
      };
    }

    if (new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return {
        valid: false,
        error:
          "This password reset link has expired (1 hour limit). Please request a new one.",
      };
    }

    return {
      valid: true,
      email: user.email,
      name: user.name,
    };
  } catch (err: unknown) {
    console.error("Validate reset token error:", err);
    return {
      valid: false,
      error: "Failed to validate reset token. Please try again.",
    };
  }
}

export async function resetPasswordWithTokenAction(
  token: string,
  newPassword: string
) {
  if (!token || !token.trim()) {
    return { error: "Invalid or missing reset token." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  try {
    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({
      where: { resetPasswordToken: token.trim(), isActive: true },
    });

    if (!user || !user.resetPasswordExpires) {
      return {
        error:
          "This password reset link is invalid or has already been used. Please request a new one.",
      };
    }

    if (new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return {
        error:
          "This password reset link has expired. Please request a new one.",
      };
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await userRepo.save(user);

    await logActivity({
      action: "password_reset_complete",
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      details: { email: user.email },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Reset password error:", err);
    return { error: "Failed to reset password. Please try again." };
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized. Please sign in first." };
  }

  if (!currentPassword || !newPassword) {
    return { error: "Both current and new passwords are required." };
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long." };
  }

  try {
    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({ where: { id: session.userId } });

    if (!user) {
      return { error: "User account not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { error: "Current password is incorrect." };
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await userRepo.save(user);

    await logActivity({
      action: "password_change",
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      details: { userId: user.id },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Change password error:", err);
    return { error: "Failed to update password. Please try again." };
  }
}

