"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getUserRepository } from "@/db/data-source";
import { User, UserRole, AdminPermission } from "@/db/entities";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function getAdminUsersAction() {
  const session = await getSession();
  if (!session || session.role !== UserRole.SUPERADMIN) {
    return { error: "Unauthorized. Only superadmin can manage users." };
  }

  try {
    const userRepo = await getUserRepository();
    const users = await userRepo.find({
      order: { createdAt: "ASC" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { users };
  } catch (err: unknown) {
    console.error("Failed to fetch admin users:", err);
    return { error: "Failed to fetch admin users." };
  }
}

export async function createAdminUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
}) {
  const session = await getSession();
  if (!session || session.role !== UserRole.SUPERADMIN) {
    return { error: "Unauthorized. Only superadmin can create new admin users." };
  }

  const email = data.email.trim().toLowerCase();
  if (!email || !data.password || !data.name) {
    return { error: "Name, email, and password are required." };
  }

  try {
    const userRepo = await getUserRepository();

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      return { error: "An admin user with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = userRepo.create({
      name: data.name.trim(),
      email,
      passwordHash,
      role: data.role || UserRole.ADMIN,
      permissions: data.permissions || [],
      isActive: true,
    });

    const saved = await userRepo.save(user);
    revalidatePath("/admin/users");

    await logActivity({
      action: "user_create",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: saved.id, name: saved.name, email: saved.email, role: saved.role },
    });

    return {
      success: true,
      user: {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        role: saved.role,
        permissions: saved.permissions,
        isActive: saved.isActive,
      },
    };
  } catch (err: unknown) {
    console.error("Failed to create admin user:", err);
    return { error: "Failed to create admin user: " + (err instanceof Error ? err.message : "Unknown error") };
  }
}

export async function updateAdminUserAction(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    permissions?: string[];
    isActive?: boolean;
  }
) {
  const session = await getSession();
  if (!session || session.role !== UserRole.SUPERADMIN) {
    return { error: "Unauthorized. Only superadmin can update users." };
  }

  try {
    const userRepo = await getUserRepository();

    const user = await userRepo.findOne({ where: { id } });
    if (!user) return { error: "User not found." };

    // Prevent deactivating or demoting the last active superadmin
    if (user.role === UserRole.SUPERADMIN && (data.role === UserRole.ADMIN || data.isActive === false)) {
      const superadminCount = await userRepo.count({
        where: { role: UserRole.SUPERADMIN, isActive: true },
      });
      if (superadminCount <= 1) {
        return { error: "Cannot disable or demote the only remaining active superadmin." };
      }
    }

    if (data.name) user.name = data.name.trim();
    if (data.email) user.email = data.email.trim().toLowerCase();
    if (data.role) user.role = data.role;
    if (data.permissions !== undefined) user.permissions = data.permissions;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    if (data.password && data.password.trim().length > 0) {
      user.passwordHash = await bcrypt.hash(data.password, 10);
    }

    await userRepo.save(user);
    revalidatePath("/admin/users");

    await logActivity({
      action: "user_update",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update admin user:", err);
    return { error: "Failed to update admin user." };
  }
}

export async function deleteAdminUserAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== UserRole.SUPERADMIN) {
    return { error: "Unauthorized. Only superadmin can delete users." };
  }

  if (session.userId === id) {
    return { error: "You cannot delete your own account." };
  }

  try {
    const userRepo = await getUserRepository();

    const user = await userRepo.findOne({ where: { id } });
    if (!user) return { error: "User not found." };

    if (user.role === UserRole.SUPERADMIN) {
      const superadminCount = await userRepo.count({
        where: { role: UserRole.SUPERADMIN },
      });
      if (superadminCount <= 1) {
        return { error: "Cannot delete the last superadmin." };
      }
    }

    await userRepo.delete({ id });
    revalidatePath("/admin/users");

    await logActivity({
      action: "user_delete",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id, name: user.name, email: user.email },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete admin user:", err);
    return { error: "Failed to delete user." };
  }
}
