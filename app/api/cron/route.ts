import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { calculateRemainingDays, shouldSendReminder } from "@/utils/stock";
import { getHolidayDatesSet, BD_DEFAULT_OFF_DAYS, isOffDay } from "@/utils/holidays";
import { sendStockReminderEmail } from "@/services/email";
import { InventoryItem } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();
    const holidayDates = getHolidayDatesSet();

    // Skip if today is a global off day (though per-user check is below)
    const today = new Date();

    const { data: items, error: itemsError } = await supabase
      .from("inventory_items")
      .select("*");

    if (itemsError) throw itemsError;

    const userItemsMap = new Map<string, InventoryItem[]>();
    for (const item of items || []) {
      const arr = userItemsMap.get(item.user_id) || [];
      arr.push(item);
      userItemsMap.set(item.user_id, arr);
    }

    let totalReminders = 0;

    for (const [userId, userItems] of userItemsMap) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("company_name, off_days")
        .eq("user_id", userId)
        .single();

      const offDays: number[] = settings?.off_days ?? BD_DEFAULT_OFF_DAYS;

      // Skip this user entirely if today is their off day
      if (isOffDay(today, offDays, holidayDates)) continue;

      const itemsNeedingReminder = userItems.filter((item) =>
        shouldSendReminder(item, offDays, holidayDates)
      );
      if (itemsNeedingReminder.length === 0) continue;

      const { data: emails } = await supabase
        .from("reminder_emails")
        .select("email")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (!emails || emails.length === 0) continue;

      const emailAddresses = emails.map((e) => e.email);

      for (const item of itemsNeedingReminder) {
        const remainingDays = calculateRemainingDays(item, offDays, holidayDates);

        try {
          await sendStockReminderEmail({
            to: emailAddresses,
            item,
            remainingDays,
            companyName: settings?.company_name || "Office",
          });

          await supabase
            .from("inventory_items")
            .update({ last_reminder_sent_at: new Date().toISOString() })
            .eq("id", item.id);

          for (const email of emailAddresses) {
            await supabase.from("reminder_logs").insert({
              user_id: userId,
              item_id: item.id,
              email_sent_to: email,
              remaining_days: remainingDays,
            });
          }

          await supabase.from("usage_logs").insert({
            user_id: userId,
            item_id: item.id,
            action: "reminder_sent",
            quantity_change: 0,
            notes: `Reminder sent for ${item.name} (${Math.round(remainingDays)} calendar days left)`,
          });

          totalReminders++;
        } catch (emailError) {
          console.error(`Failed to send reminder for ${item.name}:`, emailError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      reminders_sent: totalReminders,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
