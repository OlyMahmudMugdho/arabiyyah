"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getDataSource } from "@/db/data-source";
import { User } from "@/db/entities";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
} from "@/lib/auth";

export async function loginAdminAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      return { error: "Invalid credentials." };
    }

    if (!user.isActive) {
      return { error: "Your account is disabled. Contact superadmin." };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
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
    return { success: true };
  } catch (err: unknown) {
    console.error("Login error:", err);
    return { error: "An unexpected error occurred during login." };
  }
}

export async function logoutAdminAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function getSessionAction() {
  return await getSession();
}
