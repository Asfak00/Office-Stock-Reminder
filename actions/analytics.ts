"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUsageLogs(limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("usage_logs")
    .select("*, inventory_items(name, unit)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getAnalyticsData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [itemsResult, logsResult] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("*")
      .eq("user_id", user.id),
    supabase
      .from("usage_logs")
      .select("*, inventory_items(name)")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
  ]);

  if (itemsResult.error) throw itemsResult.error;
  if (logsResult.error) throw logsResult.error;

  const usageByDay: Record<string, number> = {};
  const usageByItem: Record<string, number> = {};

  for (const log of logsResult.data) {
    if (log.action === "usage_recorded") {
      const day = new Date(log.created_at).toISOString().split("T")[0];
      usageByDay[day] = (usageByDay[day] || 0) + Math.abs(log.quantity_change);

      const itemName = log.inventory_items?.name || "Unknown";
      usageByItem[itemName] = (usageByItem[itemName] || 0) + Math.abs(log.quantity_change);
    }
  }

  const dailyUsage = Object.entries(usageByDay)
    .map(([date, usage]) => ({ date, usage }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const topItems = Object.entries(usageByItem)
    .map(([name, usage]) => ({ name, usage }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 10);

  return {
    items: itemsResult.data,
    dailyUsage,
    topItems,
    totalLogs: logsResult.data.length,
  };
}

export async function getReminderLogs(limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("reminder_logs")
    .select("*, inventory_items(name)")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function exportInventoryCSV() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) throw error;

  const headers = ["Name", "Quantity", "Unit", "Category", "Type", "Daily Usage", "Packet Duration", "Reminder Days", "Notes"];
  const rows = data.map((item) => [
    item.name,
    item.quantity,
    item.unit,
    item.category,
    item.item_type,
    item.daily_usage ?? "",
    item.packet_duration_days ?? "",
    item.reminder_before_days,
    item.notes ?? "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  return csv;
}
