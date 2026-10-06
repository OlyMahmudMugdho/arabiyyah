import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserRepository } from "@/db/data-source";
import { logActivity } from "@/lib/activity-logger";
import { recordLatency } from "@/lib/latency-tracker";

export async function POST(req: Request) {
  const reqStart = performance.now();
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email as string)?.trim().toLowerCase();
    const otp = (body.otp as string)?.trim().replace(/\D/g, "");
    const token = (body.token as string)?.trim();
    const newPassword = (body.newPassword as string) || "";

    if (!email || (!otp && !token)) {
      return NextResponse.json(
        { error: "Email address and verification credentials are required." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({
      where: [
        ...(otp ? [{ email, resetPasswordOtp: otp, isActive: true }] : []),
        ...(token ? [{ email, resetPasswordToken: token, isActive: true }] : []),
      ],
    });

    if (!user || !user.resetPasswordExpires) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired verification session. Please verify your OTP code again.",
        },
        { status: 400 }
      );
    }

    if (new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return NextResponse.json(
        {
          error:
            "Verification code has expired (15-minute validity limit). Please request a new code.",
        },
        { status: 400 }
      );
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
      details: { email: user.email, method: "api_route" },
    });

    const reqDuration = Math.round(performance.now() - reqStart);
    recordLatency("/api/admin/reset-password-otp", reqDuration, "POST", 200);

    return NextResponse.json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (err: unknown) {
    const reqDuration = Math.round(performance.now() - reqStart);
    recordLatency("/api/admin/reset-password-otp", reqDuration, "POST", 500);
    console.error("Reset password OTP route error:", err);
    return NextResponse.json(
      {
        error:
          "An unexpected server error occurred while resetting your password. Please try again.",
      },
      { status: 500 }
    );
  }
}
