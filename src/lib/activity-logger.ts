import { getActivityLogRepository } from "@/db/data-source";
import { headers } from "next/headers";

export interface LogActivityParams {
  action: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  details?: Record<string, any> | string | null;
  ipAddress?: string | null;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    let clientIp = params.ipAddress;
    if (!clientIp) {
      try {
        const headerList = await headers();
        clientIp =
          headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          headerList.get("x-real-ip") ||
          null;
      } catch {
        // Headers might not be accessible outside of request context
      }
    }

    const activityRepo = await getActivityLogRepository();
    const log = activityRepo.create({
      action: params.action,
      userId: params.userId || null,
      userName: params.userName || null,
      userEmail: params.userEmail || null,
      details:
        typeof params.details === "object"
          ? JSON.stringify(params.details)
          : params.details || null,
      ipAddress: clientIp || null,
    });

    await activityRepo.save(log);
  } catch (err) {
    // Non-blocking: log errors to console without failing the main transaction
    console.error("Failed to record activity log:", err);
  }
}
