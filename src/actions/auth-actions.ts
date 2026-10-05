"use server";

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

