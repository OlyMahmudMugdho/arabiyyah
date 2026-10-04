import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getUserRepository } from "@/db/data-source";
import { User, UserRole, AdminPermission } from "@/db/entities";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-jwt-bayan-arabic-platform-key-2026-secure!"
);

const COOKIE_NAME = "bayan_admin_token";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      permissions: (payload.permissions as string[]) || [],
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // Verify user still exists and is active in DB
  try {
    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({
      where: { id: payload.userId, isActive: true },
    });
    if (!user) return null;

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
    };
  } catch (err) {
    console.error("Auth session lookup error:", err);
    return null;
  }
}

export function hasPermission(
  session: SessionPayload | null,
  permission: AdminPermission
): boolean {
  if (!session) return false;
  if (session.role === UserRole.SUPERADMIN) return true;
  return session.permissions.includes(permission);
}
