import { NextResponse } from "next/server";
import { getAnalyticsEventRepository } from "@/db/data-source";
import crypto from "node:crypto";

function parseDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return "mobile";
  }
  return "desktop";
}

function parseBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Internet";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "Internet Explorer";
  if (ua.includes("Edge") || ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function parseOS(ua: string): string {
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iOS")) return "iOS";
  return "Other";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      eventType,
      resourceType,
      resourceId,
      resourceTitle,
      path,
      referrer,
      searchQuery,
      metadata,
    } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    const eventPath = path || "/";

    const userAgent = req.headers.get("user-agent") || "";
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Hash IP with daily salt for anonymized unique visitor counting
    const today = new Date().toISOString().slice(0, 10);
    const ipHash = crypto
      .createHash("sha256")
      .update(`${rawIp}-${today}-arabiyyah-salt`)
      .digest("hex")
      .slice(0, 16);

    const device = parseDevice(userAgent);
    const browser = parseBrowser(userAgent);
    const os = parseOS(userAgent);
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      null;

    const analyticsRepo = await getAnalyticsEventRepository();
    const event = analyticsRepo.create({
      eventType: String(eventType).slice(0, 100),
      resourceType: resourceType ? String(resourceType).slice(0, 100) : null,
      resourceId: resourceId ? String(resourceId).slice(0, 255) : null,
      resourceTitle: resourceTitle ? String(resourceTitle).slice(0, 255) : null,
      path: String(eventPath).slice(0, 500),
      referrer: referrer ? String(referrer).slice(0, 500) : null,
      searchQuery: searchQuery ? String(searchQuery).slice(0, 255) : null,
      metadata:
        typeof metadata === "object"
          ? JSON.stringify(metadata)
          : metadata ? String(metadata) : null,
      ipHash,
      userAgent: userAgent.slice(0, 1000),
      device,
      browser,
      os,
      country,
    });

    await analyticsRepo.save(event);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analytics tracking error:", err);
    return NextResponse.json(
      { error: "Failed to record event" },
      { status: 500 }
    );
  }
}
