import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserRepository } from "@/db/data-source";
import { createSessionToken } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

const COOKIE_NAME = "arabiyyah_admin_token";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email as string)?.trim().toLowerCase();
    const password = (body.password as string) || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter both email and password." },
        { status: 400 }
      );
    }

    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "This administrator account is disabled." },
        { status: 403 }
      );
    }

    let isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid && password.trim() !== password) {
      isValid = await bcrypt.compare(password.trim(), user.passwordHash);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
    });

    const isSecure = process.env.COOKIE_SECURE === "true";
    const cookieHeader = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
      60 * 60 * 24 * 7
    }${isSecure ? "; Secure" : ""}`;
    const legacyCookieHeader = `bayan_admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
      60 * 60 * 24 * 7
    }${isSecure ? "; Secure" : ""}`;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.headers.append("Set-Cookie", cookieHeader);
    response.headers.append("Set-Cookie", legacyCookieHeader);

    await logActivity({
      action: "admin_login",
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      details: { role: user.role, method: "api_route" },
    });

    return response;
  } catch (err) {
    console.error("Login API route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
