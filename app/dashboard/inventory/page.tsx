import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { enrichItemWithStatus } from "@/utils/stock";
import { getHolidayDatesSet, BD_DEFAULT_OFF_DAYS } from "@/utils/holidays";
import { InventoryClient } from "@/components/inventory/inventory-client";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [itemsResult, settingsResult] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
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

  return <InventoryClient items={items} />;
}
