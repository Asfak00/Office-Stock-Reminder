import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageLog } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Minus,
  Edit,
  Trash2,
  Bell,
  PackagePlus,
  Activity,
} from "lucide-react";

const actionIcons: Record<string, typeof Plus> = {
  stock_added: Plus,
  stock_removed: Minus,
  usage_recorded: Minus,
  item_edited: Edit,
  item_created: PackagePlus,
  item_deleted: Trash2,
  reminder_sent: Bell,
};

const actionColors: Record<string, string> = {
  stock_added: "text-emerald-600 bg-emerald-500/10",
  stock_removed: "text-red-600 bg-red-500/10",
  usage_recorded: "text-amber-600 bg-amber-500/10",
  item_edited: "text-blue-600 bg-blue-500/10",
  item_created: "text-emerald-600 bg-emerald-500/10",
  item_deleted: "text-red-600 bg-red-500/10",
  reminder_sent: "text-purple-600 bg-purple-500/10",
};

export function DashboardRecentActivity({ logs }: { logs: UsageLog[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const Icon = actionIcons[log.action] || Activity;
              const colorClass = actionColors[log.action] || "text-muted-foreground bg-muted";
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <div className={`rounded-full p-1.5 ${colorClass}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{log.notes || log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
