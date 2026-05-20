import { InventoryItem, ItemWithStatus, StockStatus } from "@/types";
import {
  consumptionDaysToCalendarDays,
  getHolidayDatesSet,
  BD_DEFAULT_OFF_DAYS,
} from "@/utils/holidays";

/**
 * Raw consumption days — how many working days of stock remain,
 * ignoring off days and holidays.
 */
export function getConsumptionDays(item: InventoryItem): number {
  if (item.quantity <= 0) return 0;

  switch (item.item_type) {
    case "coffee":
      if (!item.daily_usage || item.daily_usage <= 0) return Infinity;
      return item.quantity / item.daily_usage;

    case "tissue":
      if (!item.packet_duration_days || item.packet_duration_days <= 0) return Infinity;
      return item.quantity * item.packet_duration_days;

    case "custom":
      if (item.daily_usage && item.daily_usage > 0) {
        return item.quantity / item.daily_usage;
      }
      if (item.packet_duration_days && item.packet_duration_days > 0) {
        return item.quantity * item.packet_duration_days;
      }
      return Infinity;

    default:
      return Infinity;
  }
}

/**
 * Calendar days until stock runs out.
 * Accounts for weekly off days + government holidays — consumption
 * only happens on working days, so the stock stretches further.
 */
export function calculateRemainingDays(
  item: InventoryItem,
  offDays: number[] = BD_DEFAULT_OFF_DAYS,
  holidayDates?: Set<string>
): number {
  const consumption = getConsumptionDays(item);
  if (consumption <= 0) return 0;
  if (!isFinite(consumption)) return Infinity;

  const holidays = holidayDates ?? getHolidayDatesSet();
  return consumptionDaysToCalendarDays(consumption, offDays, holidays);
}

export function getStockStatus(remainingDays: number, reminderBeforeDays: number): StockStatus {
  if (remainingDays <= reminderBeforeDays) return "critical";
  if (remainingDays <= reminderBeforeDays * 2) return "warning";
  return "safe";
}

export function enrichItemWithStatus(
  item: InventoryItem,
  offDays: number[] = BD_DEFAULT_OFF_DAYS,
  holidayDates?: Set<string>
): ItemWithStatus {
  const remaining_days = calculateRemainingDays(item, offDays, holidayDates);
  const status = getStockStatus(remaining_days, item.reminder_before_days);
  return { ...item, remaining_days, status };
}

export function formatRemainingDays(days: number): string {
  if (days === Infinity) return "N/A";
  if (days <= 0) return "Empty";
  if (days < 1) return "< 1 day";
  if (days === 1) return "1 day";
  return `${Math.round(days)} days`;
}

export function shouldSendReminder(
  item: InventoryItem,
  offDays: number[] = BD_DEFAULT_OFF_DAYS,
  holidayDates?: Set<string>
): boolean {
  const remainingDays = calculateRemainingDays(item, offDays, holidayDates);
  if (remainingDays === Infinity || remainingDays > item.reminder_before_days) return false;

  if (item.last_reminder_sent_at) {
    const lastSent = new Date(item.last_reminder_sent_at);
    const hoursSinceLast = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLast < 24) return false;
  }

  return true;
}
