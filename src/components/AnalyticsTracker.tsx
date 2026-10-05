"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export interface EventPayload {
  eventType:
    | "page_view"
    | "course_view"
    | "path_view"
    | "book_download"
    | "note_view"
    | "search"
    | "filter"
    | "theme_change"
    | "outbound_click";
  resourceType?: string | null;
  resourceId?: string | null;
  resourceTitle?: string | null;
  path?: string | null;
  referrer?: string | null;
  searchQuery?: string | null;
  metadata?: Record<string, any> | string | null;
  durationMs?: number | null;
}

export function trackClientEvent(payload: EventPayload) {
  if (typeof window === "undefined") return;

  const fullPayload = {
    path: payload.path || window.location.pathname,
    referrer: payload.referrer || document.referrer || null,
    ...payload,
  };

  try {
    const body = JSON.stringify(fullPayload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", body);
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Fail silently in restricted browser environments
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (!pathname) return;

    // Do not track admin management views in public metrics
    if (pathname.startsWith("/admin")) return;

    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (lastTracked.current === fullPath) return;
    lastTracked.current = fullPath;

    let navDuration: number | null = null;
    try {
      const perfNav = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming | undefined;
      if (perfNav && perfNav.responseEnd > 0 && perfNav.requestStart > 0) {
        navDuration = Math.round(perfNav.responseEnd - perfNav.requestStart);
      }
    } catch {}

    trackClientEvent({
      eventType: "page_view",
      path: fullPath,
      referrer: document.referrer || null,
      durationMs: navDuration,
    });
  }, [pathname, searchParams]);

  return null;
}
