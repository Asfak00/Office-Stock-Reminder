"use server";

import { createClient } from "@/lib/supabase/server";
import { settingsSchema, type SettingsFormData } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    const { data: newSettings } = await supabase
      .from("user_settings")
      .insert({ user_id: user.id })
      .select()
      .single();
    return newSettings;
  }

  if (error) throw error;
  return data;
}

export async function updateSettings(formData: SettingsFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validated = settingsSchema.parse(formData);

  const { data, error } = await supabase
    .from("user_settings")
    .update({
      ...validated,
      off_days: validated.off_days,
      slack_webhook_url: validated.slack_webhook_url || null,
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/settings");
  return data;
}

export async function getReminderEmails() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("reminder_emails")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addReminderEmail(email: string, name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("reminder_emails")
    .insert({ user_id: user.id, email, name })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/settings");
  return data;
}

export async function removeReminderEmail(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("reminder_emails")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/dashboard/settings");
}

export async function toggleReminderEmail(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("reminder_emails")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/dashboard/settings");
}
