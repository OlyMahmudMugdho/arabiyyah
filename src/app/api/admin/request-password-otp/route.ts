import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getUserRepository } from "@/db/data-source";
import { logActivity } from "@/lib/activity-logger";
import { recordLatency } from "@/lib/latency-tracker";
import { sendPasswordResetOtpEmail, isSmtpConfigured } from "@/lib/mailer";

export async function POST(req: Request) {
  const reqStart = performance.now();
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email as string)?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Please enter your email address." },
        { status: 400 }
      );
    }

    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({ where: { email } });

    if (!user || !user.isActive) {
      // Don't leak account existence
      return NextResponse.json({
        success: true,
        message:
          "If an authorized administrator account exists with this email, a verification code has been dispatched.",
      });
    }

    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOtp = otp;
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiresAt;
    await userRepo.save(user);

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
        method: "api_route",
      },
    });

    const reqDuration = Math.round(performance.now() - reqStart);
    recordLatency("/api/admin/request-password-otp", reqDuration, "POST", 200);

    return NextResponse.json({
      success: true,
      email: user.email,
      otpSent: emailResult.sent,
      devOtp: emailResult.devOtp,
      isSmtpConfigured: isSmtpConfigured(),
      message: emailResult.message,
    });
  } catch (err: unknown) {
    const reqDuration = Math.round(performance.now() - reqStart);
    recordLatency("/api/admin/request-password-otp", reqDuration, "POST", 500);
    console.error("Request OTP route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while requesting OTP." },
      { status: 500 }
    );
  }
}
