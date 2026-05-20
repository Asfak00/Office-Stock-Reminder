import { Badge } from "@/components/ui/badge";
import { StockStatus } from "@/types";

const statusConfig: Record<StockStatus, { label: string; variant: "safe" | "warning" | "critical" }> = {
  safe: { label: "Safe", variant: "safe" },
  warning: { label: "Warning", variant: "warning" },
  critical: { label: "Critical", variant: "critical" },
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
