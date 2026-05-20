import { getAnalyticsData, getReminderLogs } from "@/actions/analytics";
import { getInventoryItems } from "@/actions/inventory";
import { getSettings } from "@/actions/settings";
import { enrichItemWithStatus } from "@/utils/stock";
import { getHolidayDatesSet, BD_DEFAULT_OFF_DAYS } from "@/utils/holidays";
import { AnalyticsClient } from "@/components/analytics/analytics-client";

export const metadata = { title: "Analytics | Office Stock Reminder" };

export default async function AnalyticsPage() {
  const [analyticsData, items, reminderLogs, settings] = await Promise.all([
    getAnalyticsData(),
    getInventoryItems(),
    getReminderLogs(),
    getSettings(),
  ]);

  const offDays: number[] = settings?.off_days ?? BD_DEFAULT_OFF_DAYS;
  const holidayDates = getHolidayDatesSet();

  const enrichedItems = items.map((item) =>
    enrichItemWithStatus(item, offDays, holidayDates)
  );

  return (
    <AnalyticsClient
      analyticsData={analyticsData}
      items={enrichedItems}
      reminderLogs={reminderLogs}
    />
  );
}
