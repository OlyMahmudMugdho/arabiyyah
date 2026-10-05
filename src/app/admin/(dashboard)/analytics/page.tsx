import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAnalyticsDashboardDataAction } from "@/actions/analytics-actions";
import { AnalyticsDashboardView } from "./AnalyticsDashboardView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics & Activity Tracking | Arabiyyah Admin",
  description: "Comprehensive site analytics, learner engagements, and administrative audit logs.",
};

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { data, error } = await getAnalyticsDashboardDataAction("7d");

  if (error || !data) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-800 dark:text-rose-300">
        <h2 className="text-lg font-bold">Failed to load analytics</h2>
        <p className="text-sm mt-1">{error || "An unknown error occurred."}</p>
      </div>
    );
  }

  return <AnalyticsDashboardView initialData={data} />;
}
