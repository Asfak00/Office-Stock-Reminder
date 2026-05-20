export interface Holiday {
  date: string;
  name: string;
  nameBn?: string;
}

// 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_LABELS: Record<WeekDay, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const BD_DEFAULT_OFF_DAYS: WeekDay[] = [5, 6]; // Friday & Saturday

// Bangladesh Government Gazette Holidays (common recurring + fixed)
// Dates for Islamic holidays are approximate — they shift ~11 days/year on the Gregorian calendar.
// Update yearly based on the official government gazette.
export const BD_HOLIDAYS_2025: Holiday[] = [
  { date: "2025-02-21", name: "International Mother Language Day", nameBn: "আন্তর্জাতিক মাতৃভাষা দিবস" },
  { date: "2025-03-17", name: "Birthday of the Father of the Nation", nameBn: "জাতির পিতার জন্মদিন" },
  { date: "2025-03-26", name: "Independence Day", nameBn: "স্বাধীনতা দিবস" },
  { date: "2025-03-31", name: "Shab-e-Meraj", nameBn: "শবে মেরাজ" },
  { date: "2025-04-14", name: "Bengali New Year (Pohela Boishakh)", nameBn: "পহেলা বৈশাখ" },
  { date: "2025-04-15", name: "Shab-e-Barat", nameBn: "শবে বরাত" },
  { date: "2025-05-01", name: "May Day", nameBn: "মে দিবস" },
  { date: "2025-05-12", name: "Buddha Purnima", nameBn: "বুদ্ধ পূর্ণিমা" },
  { date: "2025-03-30", name: "Ramadan Start (approx)", nameBn: "রমজান শুরু" },
  { date: "2025-04-29", name: "Shab-e-Qadr", nameBn: "শবে কদর" },
  { date: "2025-04-30", name: "Eid ul-Fitr (Day 1)", nameBn: "ঈদ-উল-ফিতর" },
  { date: "2025-05-01", name: "Eid ul-Fitr (Day 2)", nameBn: "ঈদ-উল-ফিতর" },
  { date: "2025-05-02", name: "Eid ul-Fitr (Day 3)", nameBn: "ঈদ-উল-ফিতর" },
  { date: "2025-07-06", name: "Eid ul-Adha (Day 1)", nameBn: "ঈদ-উল-আযহা" },
  { date: "2025-07-07", name: "Eid ul-Adha (Day 2)", nameBn: "ঈদ-উল-আযহা" },
  { date: "2025-07-08", name: "Eid ul-Adha (Day 3)", nameBn: "ঈদ-উল-আযহা" },
  { date: "2025-07-27", name: "Shab-e-Meraj / Muharram Eve", nameBn: "মুহররম" },
  { date: "2025-08-05", name: "Ashura", nameBn: "আশুরা" },
  { date: "2025-08-15", name: "National Mourning Day", nameBn: "জাতীয় শোক দিবস" },
  { date: "2025-08-18", name: "Janmashtami", nameBn: "জন্মাষ্টমী" },
  { date: "2025-10-01", name: "Durga Puja (Bijaya Dashami)", nameBn: "বিজয়া দশমী" },
  { date: "2025-10-05", name: "Eid-e-Milad-un-Nabi", nameBn: "ঈদ-ই-মিলাদুন্নবী" },
  { date: "2025-11-05", name: "Shab-e-Qadr (Rabi-ul-Awal)", nameBn: "ফাতেহা-ই-ইয়াযদাহম" },
  { date: "2025-12-16", name: "Victory Day", nameBn: "বিজয় দিবস" },
  { date: "2025-12-25", name: "Christmas Day", nameBn: "বড়দিন" },
];

export const BD_HOLIDAYS_2026: Holiday[] = [
  { date: "2026-02-21", name: "International Mother Language Day", nameBn: "আন্তর্জাতিক মাতৃভাষা দিবস" },
  { date: "2026-03-17", name: "Birthday of the Father of the Nation", nameBn: "জাতির পিতার জন্মদিন" },
  { date: "2026-03-20", name: "Shab-e-Meraj", nameBn: "শবে মেরাজ" },
  { date: "2026-03-26", name: "Independence Day", nameBn: "স্বাধীনতা দিবস" },
  { date: "2026-04-05", name: "Shab-e-Barat", nameBn: "শবে বরাত" },
  { date: "2026-04-14", name: "Bengali New Year (Pohela Boishakh)", nameBn: "পহেলা বৈশাখ" },
  { date: "2026-04-19", name: "Shab-e-Qadr", nameBn: "শবে কদর" },
  { date: "2026-04-20", name: "Eid ul-Fitr (Day 1)", nameBn: "ঈদ-উল-ফিতর" },
  { date: "2026-04-21", name: "Eid ul-Fitr (Day 2)", nameBn: "ঈদ-উল-ফিতর" },
  { date: "2026-04-22", name: "Eid ul-Fitr (Day 3)", nameBn: "ঈদ-উল-ফিতর" },
  { date: "2026-05-01", name: "May Day / Buddha Purnima", nameBn: "মে দিবস / বুদ্ধ পূর্ণিমা" },
  { date: "2026-06-27", name: "Eid ul-Adha (Day 1)", nameBn: "ঈদ-উল-আযহা" },
  { date: "2026-06-28", name: "Eid ul-Adha (Day 2)", nameBn: "ঈদ-উল-আযহা" },
  { date: "2026-06-29", name: "Eid ul-Adha (Day 3)", nameBn: "ঈদ-উল-আযহা" },
  { date: "2026-07-26", name: "Ashura", nameBn: "আশুরা" },
  { date: "2026-08-15", name: "National Mourning Day", nameBn: "জাতীয় শোক দিবস" },
  { date: "2026-08-08", name: "Janmashtami", nameBn: "জন্মাষ্টমী" },
  { date: "2026-09-25", name: "Eid-e-Milad-un-Nabi", nameBn: "ঈদ-ই-মিলাদুন্নবী" },
  { date: "2026-10-20", name: "Durga Puja (Bijaya Dashami)", nameBn: "বিজয়া দশমী" },
  { date: "2026-12-16", name: "Victory Day", nameBn: "বিজয় দিবস" },
  { date: "2026-12-25", name: "Christmas Day", nameBn: "বড়দিন" },
];

export function getAllHolidays(): Holiday[] {
  return [...BD_HOLIDAYS_2025, ...BD_HOLIDAYS_2026];
}

export function getHolidayDatesSet(): Set<string> {
  return new Set(getAllHolidays().map((h) => h.date));
}

export function getUpcomingHolidays(limit = 10): Holiday[] {
  const today = new Date().toISOString().split("T")[0];
  return getAllHolidays()
    .filter((h) => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function isOffDay(
  date: Date,
  offDays: number[],
  holidayDates: Set<string>
): boolean {
  if (offDays.includes(date.getDay())) return true;
  const dateStr = date.toISOString().split("T")[0];
  return holidayDates.has(dateStr);
}

/**
 * Convert "consumption days" (working days of stock left) to actual
 * calendar days by counting forward from today and skipping off days
 * + government holidays.
 *
 * Example: 5 consumption days with Fri+Sat off starting from Wed →
 * Wed(1) Thu(2) [Fri skip] [Sat skip] Sun(3) Mon(4) Tue(5) = 7 calendar days
 */
export function consumptionDaysToCalendarDays(
  consumptionDays: number,
  offDays: number[],
  holidayDates: Set<string>
): number {
  if (consumptionDays <= 0) return 0;
  if (!isFinite(consumptionDays)) return Infinity;

  let calendarDays = 0;
  let workingDaysCounted = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Safety: cap at 365 * 3 to prevent infinite loops
  const maxIter = 365 * 3;

  while (workingDaysCounted < consumptionDays && calendarDays < maxIter) {
    cursor.setDate(cursor.getDate() + 1);
    calendarDays++;

    if (!isOffDay(cursor, offDays, holidayDates)) {
      workingDaysCounted++;
    }
  }

  return calendarDays;
}

/**
 * Count working days within the next N calendar days.
 * Useful for showing "X working days this week" etc.
 */
export function countWorkingDaysInRange(
  calendarDays: number,
  offDays: number[],
  holidayDates: Set<string>
): number {
  let count = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = 1; i <= calendarDays; i++) {
    cursor.setDate(cursor.getDate() + 1);
    if (!isOffDay(cursor, offDays, holidayDates)) {
      count++;
    }
  }

  return count;
}
