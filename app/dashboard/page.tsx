import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Package, AlertTriangle, Clock, Boxes } from "lucide-react";
import { StatsCard } from "@/components/shared/stats-card";
import { enrichItemWithStatus } from "@/utils/stock";
import { getHolidayDatesSet, BD_DEFAULT_OFF_DAYS } from "@/utils/holidays";
import { DashboardStockCards } from "@/components/dashboard/stock-cards";
import { DashboardRecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [itemsResult, logsResult, settingsResult] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("usage_logs")
      .select("*, inventory_items(name, unit)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("user_settings")
      .select("off_days")
      .eq("user_id", user.id)
      .single(),
  ]);

  const offDays: number[] = settingsResult.data?.off_days ?? BD_DEFAULT_OFF_DAYS;
  const holidayDates = getHolidayDatesSet();

  const items = (itemsResult.data || []).map((item) =>
    enrichItemWithStatus(item, offDays, holidayDates)
  );
  const logs = logsResult.data || [];

  const stats = {
    totalItems: items.length,
    lowStockItems: items.filter((i) => i.status === "critical").length,
    finishingSoon: items.filter((i) => i.status === "warning").length,
    totalUnits: items.reduce((sum, i) => sum + Number(i.quantity), 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your office inventory</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Items" value={stats.totalItems} icon={Package} />
        <StatsCard title="Critical Stock" value={stats.lowStockItems} icon={AlertTriangle} />
        <StatsCard title="Warning" value={stats.finishingSoon} icon={Clock} />
        <StatsCard title="Total Units" value={stats.totalUnits} icon={Boxes} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardStockCards items={items} />
        </div>
        <div>
          <DashboardRecentActivity logs={logs} />
        </div>
      </div>
    </div>
  );
}
