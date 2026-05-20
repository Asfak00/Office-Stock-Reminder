"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  safe: "hsl(var(--safe))",
  warning: "hsl(var(--warning))",
  critical: "hsl(var(--critical))",
};

interface StockDistributionChartProps {
  data: { safe: number; warning: number; critical: number };
}

export function StockDistributionChart({ data }: StockDistributionChartProps) {
  const chartData = [
    { name: "Safe", value: data.safe },
    { name: "Warning", value: data.warning },
    { name: "Critical", value: data.critical },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) return null;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={STATUS_COLORS[entry.name.toLowerCase()]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--popover-foreground))",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value} items`, ""]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
