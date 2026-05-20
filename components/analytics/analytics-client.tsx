"use client";

import { useMemo } from "react";
import { ItemWithStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/shared/stats-card";
import { EmptyState } from "@/components/shared/empty-state";
import { UsageTrendChart } from "@/components/charts/usage-trend-chart";
import { TopItemsChart } from "@/components/charts/top-items-chart";
import { StockDistributionChart } from "@/components/charts/stock-distribution-chart";
import { BarChart3, TrendingDown, Activity, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsData {
  dailyUsage: { date: string; usage: number }[];
  topItems: { name: string; usage: number }[];
  totalLogs: number;
}

interface ReminderLog {
  id: string;
  sent_at: string;
  email: string;
  remaining_days: number;
  inventory_items: { name: string } | null;
}

export function AnalyticsClient({
  analyticsData,
  items,
  reminderLogs,
}: {
  analyticsData: AnalyticsData;
  items: ItemWithStatus[];
  reminderLogs: ReminderLog[];
}) {
  const statusCounts = useMemo(() => {
    const counts = { safe: 0, warning: 0, critical: 0 };
    items.forEach((item) => counts[item.status]++);
    return counts;
  }, [items]);

  const totalUsage = analyticsData.dailyUsage.reduce((sum, d) => sum + d.usage, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Stock usage trends and insights</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Usage (30d)"
          value={totalUsage}
          icon={Activity}
        />
        <StatsCard
          title="Activity Logs"
          value={analyticsData.totalLogs}
          icon={BarChart3}
        />
        <StatsCard
          title="Low Stock Items"
          value={statusCounts.warning + statusCounts.critical}
          icon={TrendingDown}
          className={statusCounts.critical > 0 ? "border-destructive/50" : ""}
        />
        <StatsCard
          title="Reminders Sent"
          value={reminderLogs.length}
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Usage Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.dailyUsage.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No usage data"
                description="Usage data will appear here as you track consumption."
              />
            ) : (
              <UsageTrendChart data={analyticsData.dailyUsage} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Consumed Items</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.topItems.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No data"
                description="Track usage to see top consumed items."
              />
            ) : (
              <TopItemsChart data={analyticsData.topItems} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No items"
                description="Add items to see status distribution."
              />
            ) : (
              <StockDistributionChart data={statusCounts} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            {reminderLogs.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No reminders sent"
                description="Reminders will be logged here when the system sends stock alerts."
              />
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {reminderLogs.slice(0, 15).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {log.inventory_items?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {log.email} · {log.remaining_days}d remaining
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(log.sent_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
