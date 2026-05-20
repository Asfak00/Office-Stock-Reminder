"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockStatusBadge } from "@/components/shared/stock-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ItemWithStatus } from "@/types";
import { formatRemainingDays } from "@/utils/stock";
import { Package, Coffee, Toilet, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuickUsageButton } from "@/components/inventory/quick-usage-button";

const typeIcons = {
  coffee: Coffee,
  tissue: Toilet,
  custom: Box,
};

export function DashboardStockCards({ items }: { items: ItemWithStatus[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={Package}
            title="No items yet"
            description="Add your first inventory item to start tracking stock levels."
            action={
              <Link href="/dashboard/inventory">
                <Button>Add Item</Button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Stock Overview</CardTitle>
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const Icon = typeIcons[item.item_type] || Box;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-4 transition-colors",
                item.status === "critical" && "border-red-500/30 bg-red-500/5",
                item.status === "warning" && "border-amber-500/30 bg-amber-500/5",
                item.status === "safe" && "border-border"
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-2.5",
                  item.status === "critical" && "bg-red-500/10 text-red-600 dark:text-red-400",
                  item.status === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  item.status === "safe" && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{item.name}</p>
                  <StockStatusBadge status={item.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} {item.unit} — {formatRemainingDays(item.remaining_days)} left
                </p>
              </div>
              <QuickUsageButton item={item} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
