import { z } from "zod";

export const itemSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
    unit: z.string().min(1, "Unit is required"),
    category: z.string().min(1, "Category is required"),
    item_type: z.enum(["coffee", "tissue", "custom"]),
    daily_usage: z.coerce.number().min(0).nullable().optional(),
    packet_duration_days: z.coerce.number().min(0).nullable().optional(),
    reminder_before_days: z.coerce.number().int().min(1).default(3),
    notes: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.item_type === "coffee") return data.daily_usage && data.daily_usage > 0;
      return true;
    },
    { message: "Daily usage is required for coffee type", path: ["daily_usage"] }
  )
  .refine(
    (data) => {
      if (data.item_type === "tissue")
        return data.packet_duration_days && data.packet_duration_days > 0;
      return true;
    },
    { message: "Packet duration is required for tissue type", path: ["packet_duration_days"] }
  );

export const reminderEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100),
});

export const settingsSchema = z.object({
  company_name: z.string().max(200),
  default_reminder_days: z.coerce.number().int().min(1).max(30),
  timezone: z.string().min(1),
  off_days: z.array(z.number().int().min(0).max(6)).default([5, 6]),
  slack_webhook_url: z.string().url().nullable().optional().or(z.literal("")),
});

export const usageSchema = z.object({
  item_id: z.string().uuid(),
  quantity_change: z.number(),
  notes: z.string().max(200).optional(),
});

export type ItemFormData = z.infer<typeof itemSchema>;
export type ReminderEmailFormData = z.infer<typeof reminderEmailSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
