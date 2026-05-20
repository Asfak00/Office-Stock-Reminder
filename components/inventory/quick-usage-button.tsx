"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Loader2 } from "lucide-react";
import { recordUsage, addStock } from "@/actions/inventory";
import { InventoryItem } from "@/types";
import { toast } from "sonner";

export function QuickUsageButton({ item }: { item: InventoryItem }) {
  const [loading, setLoading] = useState<"use" | "add" | null>(null);

  async function handleUse() {
    setLoading("use");
    try {
      await recordUsage(item.id, -1);
      toast.success(`Used 1 ${item.unit} of ${item.name}`);
    } catch {
      toast.error("Failed to record usage");
    }
    setLoading(null);
  }

  async function handleAdd() {
    setLoading("add");
    try {
      await addStock(item.id, 1);
      toast.success(`Added 1 ${item.unit} of ${item.name}`);
    } catch {
      toast.error("Failed to add stock");
    }
    setLoading(null);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleUse}
        disabled={loading !== null || item.quantity <= 0}
      >
        {loading === "use" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleAdd}
        disabled={loading !== null}
      >
        {loading === "add" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
      </Button>
    </div>
  );
}
