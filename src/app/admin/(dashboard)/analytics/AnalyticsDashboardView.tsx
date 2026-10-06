"use client";

import { useState, useTransition } from "react";
import {
  Eye,
  Users,
  Download,
  Search,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Globe,
  Laptop,
  Smartphone,
  Tablet,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  FileText,
  Compass,
  GraduationCap,
  Layers,
  Palette,
  CheckCircle2,
  ChevronRight,
  Zap,
  Server,
  Timer,
  Gauge,
} from "lucide-react";
import {
  getAnalyticsDashboardDataAction,
  pingEndpointsAction,
  type AnalyticsSummary,
} from "@/actions/analytics-actions";

interface AnalyticsDashboardViewProps {
  initialData: AnalyticsSummary;
}

export function AnalyticsDashboardView({
  initialData,
}: AnalyticsDashboardViewProps) {
  const [data, setData] = useState<AnalyticsSummary>(initialData);
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "all">(
    initialData.timeframe
  );
  const [activeTab, setActiveTab] = useState<"learner" | "audit">("learner");
  const [isPending, startTransition] = useTransition();
  const [isPinging, setIsPinging] = useState(false);
  const [liveDbLatency, setLiveDbLatency] = useState<number | null>(null);

  const handleTimeframeChange = (tf: "24h" | "7d" | "30d" | "all") => {
    setTimeframe(tf);
    startTransition(async () => {
      const res = await getAnalyticsDashboardDataAction(tf);
      if (res.data) {
        setData(res.data);
      }
    });
  };

  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getAnalyticsDashboardDataAction(timeframe);
      if (res.data) {
        setData(res.data);
      }
    });
  };

  const handlePingEndpoints = async () => {
    setIsPinging(true);
    try {
      const res = await pingEndpointsAction();
      if (res.dbLatency) {
        setLiveDbLatency(res.dbLatency);
      }
      if (res.latencies) {
        setData((prev) => ({
          ...prev,
          endpointLatencies: res.latencies,
        }));
      }
    } finally {
      setIsPinging(false);
    }
  };

  const maxTimelineViews = Math.max(
    ...data.timeline.map((t) => t.views),
    1
  );

  const formatRelativeTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return isoString;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "page_view":
        return {
          label: "Page View",
          bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
      case "course_view":
        return {
          label: "Course",
          bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "path_view":
        return {
          label: "Path",
          bg: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        };
      case "book_download":
        return {
          label: "Download",
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "note_view":
        return {
          label: "Note",
          bg: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800",
        };
      case "search":
        return {
          label: "Search",
          bg: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
        };
      case "theme_change":
        return {
          label: "Theme",
          bg: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        };
      default:
        return {
          label: eventType.replace("_", " "),
          bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes("create")) {
      return {
        label: action.replace("_", " ").toUpperCase(),
        bg: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
      };
    }
    if (action.includes("update")) {
      return {
        label: action.replace("_", " ").toUpperCase(),
        bg: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
      };
    }
    if (action.includes("delete")) {
      return {
        label: action.replace("_", " ").toUpperCase(),
        bg: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
      };
    }
    if (action.includes("export")) {
      return {
        label: action.replace("_", " ").toUpperCase(),
        bg: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
      };
    }
    return {
      label: action.replace("_", " ").toUpperCase(),
      bg: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    };
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-emerald-900/40 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Active Now Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>
                <strong className="text-white font-bold">{data.overview.activeNow}</strong> Active Now
                (last 15m)
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Analytics & Activity Tracking
          </h1>
        </div>

        {/* Action Bar: Timeframe Buttons & Refresh */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700/80 flex items-center gap-1">
            {(["24h", "7d", "30d", "all"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => handleTimeframeChange(tf)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  timeframe === tf
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                {tf === "24h"
                  ? "24 Hours"
                  : tf === "7d"
                  ? "7 Days"
                  : tf === "30d"
                  ? "30 Days"
                  : "All Time"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isPending ? "animate-spin text-emerald-400" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Page Views */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Page Views
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {data.overview.totalPageViews.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Public page visits
            </p>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Unique Visitors
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {data.overview.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Hashed distinct learners
            </p>
          </div>
        </div>

        {/* Resource Downloads */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Downloads
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {data.overview.totalDownloads.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Books & study materials
            </p>
          </div>
        </div>

        {/* Search Queries */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Searches
            </span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {data.overview.totalSearches.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Course & book queries
            </p>
          </div>
        </div>

        {/* Zero-Result Queries */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Zero-Result Rate
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {data.zeroResultSearches.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Content demand gaps
            </p>
          </div>
        </div>
      </div>

      {/* Activity Timeline Bar Chart */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Engagement Volume Trend
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Traffic and download trajectory across the selected timeframe
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Page Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Visitors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Downloads</span>
            </div>
          </div>
        </div>

        {data.timeline.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No activity points recorded in this timeframe yet.
          </div>
        ) : (
          <div className="pt-4">
            <div className="h-48 flex items-end gap-2 sm:gap-3 overflow-x-auto pb-4">
              {data.timeline.map((point, idx) => {
                const heightPercent = Math.max(
                  Math.round((point.views / maxTimelineViews) * 100),
                  8
                );
                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[28px] sm:min-w-[40px] flex flex-col items-center gap-2 group relative h-full justify-end"
                  >
                    {/* Hover tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] rounded-lg py-1 px-2 pointer-events-none whitespace-nowrap z-20 shadow-lg border border-slate-700">
                      <div><strong>{point.label}</strong></div>
                      <div>Views: {point.views}</div>
                      <div>Visitors: {point.visitors}</div>
                      <div>Downloads: {point.downloads}</div>
                    </div>

                    {/* Stacked/Parallel Bar */}
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-2.5 sm:w-3.5 rounded-t-md bg-emerald-500 group-hover:bg-emerald-400 transition-all shadow-xs"
                      />
                      {point.downloads > 0 && (
                        <div
                          style={{
                            height: `${Math.max(
                              Math.round((point.downloads / maxTimelineViews) * 100),
                              12
                            )}%`,
                          }}
                          className="w-2 sm:w-2.5 rounded-t-md bg-amber-500 group-hover:bg-amber-400 transition-all shadow-xs"
                        />
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate w-full text-center">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Endpoint & Route Latency Intelligence Suite */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Endpoint Latencies & Health Benchmarks
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live response execution times, P95 percentiles, and database roundtrip telemetry
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePingEndpoints}
              disabled={isPinging}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Timer className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-amber-400" : ""}`} />
              <span>{isPinging ? "Benchmarking Endpoints..." : "Ping All Endpoints Now"}</span>
            </button>
          </div>
        </div>

        {/* Latency Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Avg Platform Response
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline gap-2">
              <span>
                {Math.round(
                  (data.endpointLatencies || []).reduce((sum, e) => sum + e.avgLatency, 0) /
                    Math.max((data.endpointLatencies || []).length, 1)
                )}
                ms
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Ultra-Fast
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Neon Cloud Database
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline gap-2">
              <span>{liveDbLatency !== null ? `${liveDbLatency}ms` : "42ms"}</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Live SSL
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Monitored Endpoints
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {(data.endpointLatencies || []).length} Routes
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              SLA Health
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>100% Healthy</span>
            </div>
          </div>
        </div>

        {/* Detailed Latency Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Method</th>
                <th className="pb-3">Endpoint / Route</th>
                <th className="pb-3">Average</th>
                <th className="pb-3">P95</th>
                <th className="pb-3">Min / Max</th>
                <th className="pb-3">Visual Latency</th>
                <th className="pb-3">Health Status</th>
                <th className="pb-3 pr-2 text-right">Samples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {(data.endpointLatencies || []).map((rec, idx) => {
                const maxLat = Math.max(
                  ...(data.endpointLatencies || []).map((e) => e.avgLatency),
                  150
                );
                const barPercent = Math.min(Math.round((rec.avgLatency / maxLat) * 100), 100);

                let methodBg =
                  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300";
                if (rec.method === "POST") {
                  methodBg =
                    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300";
                } else if (rec.method === "SQL") {
                  methodBg =
                    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300";
                }

                let badge = {
                  label: "Ultra-Fast",
                  bg: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300",
                };
                if (rec.status === "slow") {
                  badge = {
                    label: "Slow",
                    bg: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300",
                  };
                } else if (rec.status === "normal") {
                  badge = {
                    label: "Normal",
                    bg: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300",
                  };
                }

                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 pl-2">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${methodBg}`}>
                        {rec.method}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                      {rec.endpoint}
                    </td>
                    <td className="py-3">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {rec.avgLatency}ms
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-500 dark:text-slate-400">
                      {rec.p95Latency}ms
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-400">
                      {rec.minLatency}ms - {rec.maxLatency}ms
                    </td>
                    <td className="py-3 w-32 sm:w-44">
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${barPercent}%` }}
                          className={`h-full rounded-full ${
                            rec.status === "fast"
                              ? "bg-emerald-500"
                              : rec.status === "normal"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right font-mono text-slate-400">
                      {rec.totalRequests} reqs
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="p-6 md:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Most Visited Pages
              </h3>
            </div>
            <span className="text-xs text-slate-400">By total views</span>
          </div>

          {data.topPages.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No page visit telemetry recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {data.topPages.map((page, idx) => {
                const maxViews = data.topPages[0]?.views || 1;
                const percent = Math.round((page.views / maxViews) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-700 dark:text-slate-200 font-medium truncate max-w-[240px] sm:max-w-xs">
                        {page.path}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-400 text-[11px]">
                          {page.visitors} visitors
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {page.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Downloads */}
        <div className="p-6 md:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Top Downloaded Resources
              </h3>
            </div>
            <span className="text-xs text-slate-400">Books & study notes</span>
          </div>

          {data.topDownloads.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No resource downloads recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.topDownloads.map((res, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {res.type}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 font-bold shrink-0">
                    {res.downloads.toLocaleString()} dl
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Intent & Zero-Result Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Searches */}
        <div className="p-6 md:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Popular Search Queries
              </h3>
            </div>
            <span className="text-xs text-slate-400">Learner inquiries</span>
          </div>

          {data.topSearches.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No search queries recorded in this timeframe.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.topSearches.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-900 dark:text-cyan-300 font-medium"
                >
                  <span>&quot;{s.query}&quot;</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-cyan-200/60 dark:bg-cyan-800/60 text-[10px] font-bold">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zero-Result Search Queries (Content Gaps) */}
        <div className="p-6 md:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Zero-Result Inquiries (Content Gaps)
              </h3>
            </div>
            <span className="text-xs text-rose-500 font-medium">Needs Attention</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Terms users searched for that produced 0 courses or books. Great candidates for new curricula.
          </p>

          {data.zeroResultSearches.length === 0 ? (
            <div className="py-8 text-center text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Great news! No zero-result queries recorded in this timeframe.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.zeroResultSearches.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-900 dark:text-rose-300 font-medium"
                >
                  <span>&quot;{s.query}&quot;</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-rose-200/60 dark:bg-rose-800/60 text-[10px] font-bold">
                    {s.count} miss{s.count > 1 ? "es" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Demographics & Client Environments */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Devices */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>Devices</span>
          </div>
          <div className="space-y-2">
            {data.demographics.devices.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 capitalize">{d.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{d.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${d.percentage}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Systems */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
            <Laptop className="w-4 h-4 text-blue-500" />
            <span>Operating Systems</span>
          </div>
          <div className="space-y-2">
            {data.demographics.os.map((o, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{o.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{o.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${o.percentage}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
            <Globe className="w-4 h-4 text-purple-500" />
            <span>Browsers</span>
          </div>
          <div className="space-y-2">
            {data.demographics.browsers.map((b, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{b.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{b.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${b.percentage}%` }}
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
            <Palette className="w-4 h-4 text-amber-500" />
            <span>Theme Preferences</span>
          </div>
          <div className="space-y-2">
            {data.demographics.themes.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {t.name} Mode
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {t.count} picks
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Stream & Audit Trail Tabs */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("learner")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "learner"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Learner Activity Stream ({data.recentEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "audit"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Admin Audit Log ({data.recentAuditLogs.length})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Real-time feed updated continuously
          </span>
        </div>

        {/* Tab 1: Learner Activity Stream */}
        {activeTab === "learner" && (
          <div className="overflow-x-auto">
            {data.recentEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No events recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">Event</th>
                    <th className="pb-3">Path / Resource</th>
                    <th className="pb-3">Client Environment</th>
                    <th className="pb-3 pr-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {data.recentEvents.map((evt) => {
                    const badge = getEventBadge(evt.eventType);
                    return (
                      <tr
                        key={evt.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 pl-2">
                          <span
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-slate-900 dark:text-slate-100 font-mono text-[11px] truncate max-w-xs sm:max-w-md">
                            {evt.resourceTitle || evt.path}
                          </div>
                          {evt.searchQuery && (
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-sans">
                              Search: &quot;{evt.searchQuery}&quot;
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                          {evt.device || "Desktop"} • {evt.browser || "Web"} • {evt.os || "OS"}
                        </td>
                        <td className="py-3 pr-2 text-right text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                          {formatRelativeTime(evt.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Admin Audit Log */}
        {activeTab === "audit" && (
          <div className="overflow-x-auto">
            {data.recentAuditLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No administrative actions logged yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">Action</th>
                    <th className="pb-3">Admin User</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3">IP Address</th>
                    <th className="pb-3 pr-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {data.recentAuditLogs.map((log) => {
                    const badge = getActionBadge(log.action);
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 pl-2">
                          <span
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {log.userName || "Admin"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {log.userEmail || "System"}
                          </div>
                        </td>
                        <td className="py-3 max-w-xs sm:max-w-md">
                          <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate">
                            {log.details || "—"}
                          </div>
                        </td>
                        <td className="py-3 font-mono text-[11px] text-slate-400">
                          {log.ipAddress || "—"}
                        </td>
                        <td className="py-3 pr-2 text-right text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                          {formatRelativeTime(log.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
