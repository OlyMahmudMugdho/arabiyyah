"use server";

import { getAnalyticsEventRepository, getActivityLogRepository } from "@/db/data-source";
import { getSession } from "@/lib/auth";
import {
  getEndpointLatencyStats,
  pingDatabaseLatency,
  type EndpointLatencyStats,
} from "@/lib/latency-tracker";

export interface AnalyticsSummary {
  timeframe: "24h" | "7d" | "30d" | "all";
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    totalDownloads: number;
    totalSearches: number;
    activeNow: number;
  };
  endpointLatencies: EndpointLatencyStats[];
  timeline: {
    label: string;
    views: number;
    visitors: number;
    downloads: number;
  }[];
  topPages: {
    path: string;
    views: number;
    visitors: number;
  }[];
  topDownloads: {
    title: string;
    type: string;
    downloads: number;
  }[];
  topSearches: {
    query: string;
    count: number;
  }[];
  zeroResultSearches: {
    query: string;
    count: number;
  }[];
  demographics: {
    devices: { name: string; count: number; percentage: number }[];
    browsers: { name: string; count: number; percentage: number }[];
    os: { name: string; count: number; percentage: number }[];
    themes: { name: string; count: number }[];
  };
  recentEvents: {
    id: string;
    eventType: string;
    resourceType: string | null;
    resourceTitle: string | null;
    path: string;
    searchQuery: string | null;
    device: string | null;
    browser: string | null;
    os: string | null;
    createdAt: string;
  }[];
  recentAuditLogs: {
    id: string;
    action: string;
    userName: string | null;
    userEmail: string | null;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
  }[];
}

export async function getAnalyticsDashboardDataAction(
  timeframe: "24h" | "7d" | "30d" | "all" = "7d"
): Promise<{ data?: AnalyticsSummary; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized. Admin session required to view platform analytics." };
  }

  try {
    const analyticsRepo = await getAnalyticsEventRepository();
    const activityRepo = await getActivityLogRepository();

    const now = new Date();
    let since: Date | null = null;
    if (timeframe === "24h") {
      since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === "7d") {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "30d") {
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // 1. Overview metrics
    const buildBaseQuery = (alias: string) => {
      const q = analyticsRepo.createQueryBuilder(alias);
      if (since) {
        q.andWhere(`${alias}.createdAt >= :since`, { since });
      }
      return q;
    };

    // Total Page Views
    const totalPageViewsPromise = buildBaseQuery("e")
      .andWhere("e.eventType = :ev", { ev: "page_view" })
      .getCount();

    // Unique Visitors
    const uniqueVisitorsPromise = buildBaseQuery("e")
      .select("COUNT(DISTINCT e.ipHash)", "count")
      .getRawOne()
      .then((res) => parseInt(res?.count || "0", 10));

    // Total Downloads
    const totalDownloadsPromise = buildBaseQuery("e")
      .andWhere("e.eventType = :ev", { ev: "book_download" })
      .getCount();

    // Total Searches
    const totalSearchesPromise = buildBaseQuery("e")
      .andWhere("e.eventType = :ev", { ev: "search" })
      .getCount();

    // Active Now (last 15m)
    const activeNowPromise = analyticsRepo
      .createQueryBuilder("e")
      .select("COUNT(DISTINCT e.ipHash)", "count")
      .where("e.createdAt >= :fifteenMinutesAgo", { fifteenMinutesAgo })
      .getRawOne()
      .then((res) => parseInt(res?.count || "0", 10));

    // Top Pages
    const topPagesPromise = buildBaseQuery("e")
      .select("e.path", "path")
      .addSelect("COUNT(*)", "views")
      .addSelect("COUNT(DISTINCT e.ipHash)", "visitors")
      .where("e.eventType = :ev", { ev: "page_view" })
      .groupBy("e.path")
      .orderBy("views", "DESC")
      .limit(8)
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          path: r.path || "/",
          views: parseInt(r.views || "0", 10),
          visitors: parseInt(r.visitors || "0", 10),
        }))
      );

    // Top Downloads
    const topDownloadsPromise = buildBaseQuery("e")
      .select("e.resourceTitle", "title")
      .addSelect("e.resourceType", "type")
      .addSelect("COUNT(*)", "downloads")
      .where("e.eventType = :ev", { ev: "book_download" })
      .andWhere("e.resourceTitle IS NOT NULL")
      .groupBy("e.resourceTitle")
      .addGroupBy("e.resourceType")
      .orderBy("downloads", "DESC")
      .limit(8)
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          title: r.title,
          type: r.type || "resource",
          downloads: parseInt(r.downloads || "0", 10),
        }))
      );

    // Top Searches
    const topSearchesPromise = buildBaseQuery("e")
      .select("LOWER(e.searchQuery)", "query")
      .addSelect("COUNT(*)", "count")
      .where("e.eventType = :ev", { ev: "search" })
      .andWhere("e.searchQuery IS NOT NULL AND e.searchQuery != ''")
      .groupBy("LOWER(e.searchQuery)")
      .orderBy("count", "DESC")
      .limit(8)
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          query: r.query,
          count: parseInt(r.count || "0", 10),
        }))
      );

    // Zero-Result Searches (users looking for terms that yielded 0 hits)
    const zeroResultSearchesPromise = buildBaseQuery("e")
      .select("LOWER(e.searchQuery)", "query")
      .addSelect("COUNT(*)", "count")
      .where("e.eventType = :ev", { ev: "search" })
      .andWhere("e.searchQuery IS NOT NULL AND e.searchQuery != ''")
      .andWhere("(e.metadata LIKE '%resultsCount\":0%' OR e.metadata LIKE '%resultsCount\": 0%')")
      .groupBy("LOWER(e.searchQuery)")
      .orderBy("count", "DESC")
      .limit(8)
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          query: r.query,
          count: parseInt(r.count || "0", 10),
        }))
      );

    // Devices Breakdown
    const devicesPromise = buildBaseQuery("e")
      .select("COALESCE(e.device, 'Desktop')", "name")
      .addSelect("COUNT(*)", "count")
      .groupBy("COALESCE(e.device, 'Desktop')")
      .orderBy("count", "DESC")
      .getRawMany();

    // Browsers Breakdown
    const browsersPromise = buildBaseQuery("e")
      .select("COALESCE(e.browser, 'Other')", "name")
      .addSelect("COUNT(*)", "count")
      .groupBy("COALESCE(e.browser, 'Other')")
      .orderBy("count", "DESC")
      .limit(6)
      .getRawMany();

    // OS Breakdown
    const osPromise = buildBaseQuery("e")
      .select("COALESCE(e.os, 'Other')", "name")
      .addSelect("COUNT(*)", "count")
      .groupBy("COALESCE(e.os, 'Other')")
      .orderBy("count", "DESC")
      .limit(6)
      .getRawMany();

    // Theme switches
    const themesPromise = buildBaseQuery("e")
      .select("e.metadata", "metadata")
      .addSelect("COUNT(*)", "count")
      .where("e.eventType = :ev", { ev: "theme_change" })
      .groupBy("e.metadata")
      .getRawMany()
      .then((rows) => {
        const counts: Record<string, number> = {
          dark: 0,
          light: 0,
          sepia: 0,
          system: 0,
        };
        rows.forEach((r) => {
          try {
            const parsed = JSON.parse(r.metadata || "{}");
            const t = (parsed.selectedTheme || "").toLowerCase();
            if (counts[t] !== undefined) {
              counts[t] += parseInt(r.count || "0", 10);
            }
          } catch {}
        });
        return Object.entries(counts).map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count,
        }));
      });

    // Timeline Trends (last 24 hours in 2h intervals, or daily for 7d/30d/all)
    let timelinePromise: Promise<AnalyticsSummary["timeline"]>;
    if (timeframe === "24h") {
      // Group by hour
      timelinePromise = buildBaseQuery("e")
        .select("TO_CHAR(e.createdAt, 'YYYY-MM-DD HH24:00')", "timebucket")
        .addSelect("SUM(CASE WHEN e.eventType = 'page_view' THEN 1 ELSE 0 END)", "views")
        .addSelect("COUNT(DISTINCT e.ipHash)", "visitors")
        .addSelect("SUM(CASE WHEN e.eventType = 'book_download' THEN 1 ELSE 0 END)", "downloads")
        .groupBy("timebucket")
        .orderBy("timebucket", "ASC")
        .getRawMany()
        .then((rows) =>
          rows.map((r) => {
            const timePart = (r.timebucket || "").split(" ")[1] || "";
            return {
              label: timePart || r.timebucket,
              views: parseInt(r.views || "0", 10),
              visitors: parseInt(r.visitors || "0", 10),
              downloads: parseInt(r.downloads || "0", 10),
            };
          })
        );
    } else {
      // Group by date YYYY-MM-DD
      timelinePromise = buildBaseQuery("e")
        .select("TO_CHAR(e.createdAt, 'YYYY-MM-DD')", "day")
        .addSelect("SUM(CASE WHEN e.eventType = 'page_view' THEN 1 ELSE 0 END)", "views")
        .addSelect("COUNT(DISTINCT e.ipHash)", "visitors")
        .addSelect("SUM(CASE WHEN e.eventType = 'book_download' THEN 1 ELSE 0 END)", "downloads")
        .groupBy("day")
        .orderBy("day", "ASC")
        .getRawMany()
        .then((rows) =>
          rows.map((r) => {
            const d = new Date(r.day);
            const formatted = isNaN(d.getTime())
              ? r.day
              : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return {
              label: formatted,
              views: parseInt(r.views || "0", 10),
              visitors: parseInt(r.visitors || "0", 10),
              downloads: parseInt(r.downloads || "0", 10),
            };
          })
        );
    }

    // Recent Live Events (latest 40 raw activities)
    const recentEventsPromise = analyticsRepo.find({
      order: { createdAt: "DESC" },
      take: 40,
    });

    // Recent Administrative Activity Logs
    const recentAuditLogsPromise = activityRepo.find({
      order: { createdAt: "DESC" },
      take: 40,
    });

    const endpointLatenciesPromise = getEndpointLatencyStats();

    // Run in parallel for high speed
    const [
      totalPageViews,
      uniqueVisitors,
      totalDownloads,
      totalSearches,
      activeNow,
      topPages,
      topDownloads,
      topSearches,
      zeroResultSearches,
      deviceRows,
      browserRows,
      osRows,
      themes,
      timeline,
      recentEvents,
      recentAuditLogs,
      endpointLatencies,
    ] = await Promise.all([
      totalPageViewsPromise,
      uniqueVisitorsPromise,
      totalDownloadsPromise,
      totalSearchesPromise,
      activeNowPromise,
      topPagesPromise,
      topDownloadsPromise,
      topSearchesPromise,
      zeroResultSearchesPromise,
      devicesPromise,
      browsersPromise,
      osPromise,
      themesPromise,
      timelinePromise,
      recentEventsPromise,
      recentAuditLogsPromise,
      endpointLatenciesPromise,
    ]);

    // Format demographics with percentages
    const totalDeviceCount = deviceRows.reduce(
      (sum, r) => sum + parseInt(r.count || "0", 10),
      0
    );
    const devices = deviceRows.map((r) => {
      const count = parseInt(r.count || "0", 10);
      return {
        name: r.name,
        count,
        percentage:
          totalDeviceCount > 0 ? Math.round((count / totalDeviceCount) * 100) : 0,
      };
    });

    const totalBrowserCount = browserRows.reduce(
      (sum, r) => sum + parseInt(r.count || "0", 10),
      0
    );
    const browsers = browserRows.map((r) => {
      const count = parseInt(r.count || "0", 10);
      return {
        name: r.name,
        count,
        percentage:
          totalBrowserCount > 0 ? Math.round((count / totalBrowserCount) * 100) : 0,
      };
    });

    const totalOsCount = osRows.reduce(
      (sum, r) => sum + parseInt(r.count || "0", 10),
      0
    );
    const os = osRows.map((r) => {
      const count = parseInt(r.count || "0", 10);
      return {
        name: r.name,
        count,
        percentage:
          totalOsCount > 0 ? Math.round((count / totalOsCount) * 100) : 0,
      };
    });

    return {
      data: {
        timeframe,
        overview: {
          totalPageViews,
          uniqueVisitors,
          totalDownloads,
          totalSearches,
          activeNow,
        },
        endpointLatencies,
        timeline,
        topPages,
        topDownloads,
        topSearches,
        zeroResultSearches,
        demographics: {
          devices,
          browsers,
          os,
          themes,
        },
        recentEvents: recentEvents.map((e) => ({
          id: e.id,
          eventType: e.eventType,
          resourceType: e.resourceType,
          resourceTitle: e.resourceTitle,
          path: e.path,
          searchQuery: e.searchQuery,
          device: e.device,
          browser: e.browser,
          os: e.os,
          createdAt: e.createdAt.toISOString(),
        })),
        recentAuditLogs: recentAuditLogs.map((l) => ({
          id: l.id,
          action: l.action,
          userName: l.userName,
          userEmail: l.userEmail,
          details: l.details,
          ipAddress: l.ipAddress,
          createdAt: l.createdAt.toISOString(),
        })),
      },
    };
  } catch (err: unknown) {
    console.error("Failed to compile analytics dashboard data:", err);
    return {
      error: "Failed to compile analytics data: " + (err instanceof Error ? err.message : "Unknown error"),
    };
  }
}

export async function pingEndpointsAction() {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const dbLatency = await pingDatabaseLatency();
  const latencies = await getEndpointLatencyStats();
  return { dbLatency, latencies };
}
