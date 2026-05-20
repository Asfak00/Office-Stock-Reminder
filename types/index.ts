export type ItemType = "coffee" | "tissue" | "custom";

export type StockStatus = "safe" | "warning" | "critical";

export type ActionType =
  | "stock_added"
  | "stock_removed"
  | "usage_recorded"
  | "item_edited"
  | "item_created"
  | "item_deleted"
  | "reminder_sent";

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  item_type: ItemType;
  daily_usage: number | null;
  packet_duration_days: number | null;
  reminder_before_days: number;
  notes: string | null;
  last_reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  item_id: string;
  action: ActionType;
  quantity_change: number;
  notes: string | null;
  created_at: string;
  inventory_items?: Pick<InventoryItem, "name" | "unit">;
}

export interface ReminderEmail {
  id: string;
  user_id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface ReminderLog {
  id: string;
  user_id: string;
  item_id: string;
  email_sent_to: string;
  remaining_days: number;
  sent_at: string;
  inventory_items?: Pick<InventoryItem, "name">;
}

export interface UserSettings {
  id: string;
  user_id: string;
  company_name: string;
  default_reminder_days: number;
  timezone: string;
  off_days: number[];
  slack_webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  finishingSoon: number;
  totalUnits: number;
}

export interface ItemWithStatus extends InventoryItem {
  remaining_days: number;
  status: StockStatus;
}
