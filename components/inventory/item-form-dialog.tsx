"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, type ItemFormData } from "@/lib/validations";
import { createInventoryItem, updateInventoryItem } from "@/actions/inventory";
import { InventoryItem, ItemType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
}

const categories = ["Beverages", "Cleaning", "Kitchen", "Office Supplies", "Bathroom", "Other"];
const units = ["pcs", "packets", "boxes", "kg", "liters", "rolls", "bags"];

export function ItemFormDialog({ open, onOpenChange, item }: ItemFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!item;

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: item
      ? {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          item_type: item.item_type,
          daily_usage: item.daily_usage,
          packet_duration_days: item.packet_duration_days,
          reminder_before_days: item.reminder_before_days,
          notes: item.notes,
        }
      : {
          name: "",
          quantity: 0,
          unit: "pcs",
          category: "Beverages",
          item_type: "custom",
          daily_usage: null,
          packet_duration_days: null,
          reminder_before_days: 3,
          notes: "",
        },
  });

  const itemType = form.watch("item_type");

  async function onSubmit(data: ItemFormData) {
    setLoading(true);
    try {
      if (isEdit && item) {
        await updateInventoryItem(item.id, data);
        toast.success(`${data.name} updated`);
      } else {
        await createInventoryItem(data);
        toast.success(`${data.name} added to inventory`);
      }
      onOpenChange(false);
      form.reset();
    } catch (err) {
      toast.error(isEdit ? "Failed to update item" : "Failed to add item");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update item details" : "Add a consumable item to track"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="e.g. Coffee Packets" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Item Type</Label>
              <Select
                value={itemType}
                onValueChange={(v) => form.setValue("item_type", v as ItemType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee">Coffee (daily usage)</SelectItem>
                  <SelectItem value="tissue">Tissue (packet duration)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min={0} {...form.register("quantity")} />
              {form.formState.errors.quantity && (
                <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={form.watch("unit")}
                onValueChange={(v) => form.setValue("unit", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(itemType === "coffee" || itemType === "custom") && (
              <div className="space-y-2">
                <Label htmlFor="daily_usage">Daily Usage</Label>
                <Input
                  id="daily_usage"
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="e.g. 15"
                  {...form.register("daily_usage")}
                />
                {form.formState.errors.daily_usage && (
                  <p className="text-xs text-destructive">{form.formState.errors.daily_usage.message}</p>
                )}
              </div>
            )}

            {(itemType === "tissue" || itemType === "custom") && (
              <div className="space-y-2">
                <Label htmlFor="packet_duration_days">Packet Duration (days)</Label>
                <Input
                  id="packet_duration_days"
                  type="number"
                  min={0}
                  placeholder="e.g. 14"
                  {...form.register("packet_duration_days")}
                />
                {form.formState.errors.packet_duration_days && (
                  <p className="text-xs text-destructive">{form.formState.errors.packet_duration_days.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reminder_before_days">Remind Before (days)</Label>
              <Input
                id="reminder_before_days"
                type="number"
                min={1}
                {...form.register("reminder_before_days")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" placeholder="Any additional notes..." {...form.register("notes")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
