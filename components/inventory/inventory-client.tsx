"use client";

import { useState, useMemo } from "react";
import { ItemWithStatus, ItemType } from "@/types";
import { deleteInventoryItem } from "@/actions/inventory";
import { exportInventoryCSV } from "@/actions/analytics";
import { formatRemainingDays } from "@/utils/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StockStatusBadge } from "@/components/shared/stock-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ItemFormDialog } from "@/components/inventory/item-form-dialog";
import { QuickUsageButton } from "@/components/inventory/quick-usage-button";
import {
  Plus, Search, Package, MoreHorizontal, Edit, Trash2, Download, Coffee, Toilet, Box,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const typeIcons: Record<ItemType, typeof Coffee> = {
  coffee: Coffee,
  tissue: Toilet,
  custom: Box,
};

export function InventoryClient({ items }: { items: ItemWithStatus[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItemWithStatus | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || item.item_type === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [items, search, typeFilter, statusFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteInventoryItem(deleteId);
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
    setDeleteId(null);
  }

  async function handleExport() {
    try {
      const csv = await exportInventoryCSV();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your office stock items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={() => { setEditItem(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="coffee">Coffee</SelectItem>
                <SelectItem value="tissue">Tissue</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title={items.length === 0 ? "No items yet" : "No matching items"}
              description={
                items.length === 0
                  ? "Add your first item to start tracking stock."
                  : "Try adjusting your search or filters."
              }
              action={
                items.length === 0 ? (
                  <Button onClick={() => setFormOpen(true)}>Add First Item</Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => {
                const Icon = typeIcons[item.item_type] || Box;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{item.name}</p>
                        <StockStatusBadge status={item.status} />
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.quantity} {item.unit} · {formatRemainingDays(item.remaining_days)} left
                        {item.item_type === "coffee" && item.daily_usage && ` · ${item.daily_usage}/day`}
                        {item.item_type === "tissue" && item.packet_duration_days && ` · ${item.packet_duration_days}d/packet`}
                      </p>
                    </div>

                    <QuickUsageButton item={item} />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditItem(item); setFormOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ItemFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditItem(null); }}
        item={editItem}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete Item"
        description="This will permanently delete this inventory item and its usage history. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
