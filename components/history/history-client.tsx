"use client";

import { useState, useMemo } from "react";
import { UsageLog, ActionType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Search, History, Minus, Plus, Edit, Trash2, Bell, ChevronLeft, ChevronRight,
} from "lucide-react";

const actionConfig: Record<ActionType, { label: string; icon: typeof Plus; color: string }> = {
  usage_recorded: { label: "Used", icon: Minus, color: "text-orange-500" },
  stock_added: { label: "Restocked", icon: Plus, color: "text-green-500" },
  stock_removed: { label: "Removed", icon: Minus, color: "text-red-400" },
  item_created: { label: "Created", icon: Plus, color: "text-blue-500" },
  item_edited: { label: "Updated", icon: Edit, color: "text-purple-500" },
  item_deleted: { label: "Deleted", icon: Trash2, color: "text-red-500" },
  reminder_sent: { label: "Reminder", icon: Bell, color: "text-yellow-500" },
};

const PAGE_SIZE = 20;

export function HistoryClient({ logs }: { logs: UsageLog[] }) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const itemName = log.inventory_items?.name || "";
      const matchesSearch =
        itemName.toLowerCase().includes(search.toLowerCase()) ||
        log.notes?.toLowerCase().includes(search.toLowerCase());
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity History</h1>
        <p className="text-muted-foreground">Track all stock changes and actions</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="usage_recorded">Usage</SelectItem>
                <SelectItem value="stock_added">Restock</SelectItem>
                <SelectItem value="stock_removed">Removed</SelectItem>
                <SelectItem value="item_created">Created</SelectItem>
                <SelectItem value="item_edited">Edited</SelectItem>
                <SelectItem value="item_deleted">Deleted</SelectItem>
                <SelectItem value="reminder_sent">Reminders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState
              icon={History}
              title="No activity yet"
              description="Activity will appear here as you use the app."
            />
          ) : (
            <>
              <div className="space-y-1">
                {paginated.map((log) => {
                  const config = actionConfig[log.action] || actionConfig.usage_recorded;
                  const Icon = config.icon;
                  const itemName = log.inventory_items?.name;
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className={`rounded-full p-2 bg-muted ${config.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {config.label}
                          {itemName && (
                            <span className="text-muted-foreground"> — {itemName}</span>
                          )}
                        </p>
                        {log.notes && (
                          <p className="text-xs text-muted-foreground truncate">{log.notes}</p>
                        )}
                      </div>
                      {log.quantity_change !== 0 && (
                        <Badge variant="outline" className="text-xs tabular-nums">
                          {log.quantity_change > 0 ? "+" : ""}
                          {log.quantity_change}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {filtered.length} total entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm tabular-nums">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
