"use server";

import { createClient } from "@/lib/supabase/server";
import { itemSchema, type ItemFormData } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getInventoryItems() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInventoryItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function createInventoryItem(formData: ItemFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validated = itemSchema.parse(formData);

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({ ...validated, user_id: user.id })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    item_id: data.id,
    action: "item_created",
    quantity_change: validated.quantity,
    notes: `Created ${validated.name}`,
  });

  revalidatePath("/dashboard");
  return data;
}

export async function updateInventoryItem(id: string, formData: ItemFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validated = itemSchema.parse(formData);

  const { data, error } = await supabase
    .from("inventory_items")
    .update(validated)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    item_id: id,
    action: "item_edited",
    quantity_change: 0,
    notes: `Updated ${validated.name}`,
  });

  revalidatePath("/dashboard");
  return data;
}

export async function deleteInventoryItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: item } = await supabase
    .from("inventory_items")
    .select("name")
    .eq("id", id)
    .single();

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    item_id: id,
    action: "item_deleted",
    quantity_change: 0,
    notes: `Deleted ${item?.name}`,
  });

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/dashboard");
}

export async function recordUsage(itemId: string, quantityChange: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: item, error: fetchError } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !item) throw new Error("Item not found");

  const newQuantity = Math.max(0, item.quantity + quantityChange);

  const { error: updateError } = await supabase
    .from("inventory_items")
    .update({ quantity: newQuantity })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (updateError) throw updateError;

  const action = quantityChange > 0 ? "stock_added" : "usage_recorded";

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    item_id: itemId,
    action,
    quantity_change: quantityChange,
    notes: `${quantityChange > 0 ? "Added" : "Used"} ${Math.abs(quantityChange)} ${item.unit}`,
  });

  revalidatePath("/dashboard");
  return { ...item, quantity: newQuantity };
}

export async function addStock(itemId: string, amount: number) {
  return recordUsage(itemId, Math.abs(amount));
}
