import { NextResponse } from "next/server";
import { getUserRepository } from "@/db/data-source";
import { recordLatency } from "@/lib/latency-tracker";

export async function POST(req: Request) {
  const reqStart = performance.now();
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email as string)?.trim().toLowerCase();
    const otp = (body.otp as string)?.trim().replace(/\D/g, "");

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Both email and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: "Verification code must be exactly 6 digits." },
        { status: 400 }
      );
    }

    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({
      where: { email, resetPasswordOtp: otp, isActive: true },
    });

    if (!user || !user.resetPasswordExpires) {
      return NextResponse.json(
        {
          error:
            "Invalid verification code or email. Please check the 6-digit code and try again.",
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

    const reqDuration = Math.round(performance.now() - reqStart);
    recordLatency("/api/admin/verify-password-otp", reqDuration, "POST", 200);

    return NextResponse.json({
      success: true,
      email: user.email,
      name: user.name,
      token: user.resetPasswordToken,
      message: "Code verified successfully.",
    });
  } catch (err: unknown) {
    const reqDuration = Math.round(performance.now() - reqStart);
    recordLatency("/api/admin/verify-password-otp", reqDuration, "POST", 500);
    console.error("Verify OTP API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while verifying the code." },
      { status: 500 }
    );
  }
}
