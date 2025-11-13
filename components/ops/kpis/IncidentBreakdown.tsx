"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTicketStore, selectTickets } from "@/lib/store/ticketStore";
import { useAlertStore, selectAlerts } from "@/lib/store/alertStore";
import { calculateIncidentBreakdown } from "@/lib/utils/atmMetrics";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export function IncidentBreakdown() {
  const tickets = useTicketStore(selectTickets);
  const alerts = useAlertStore(selectAlerts);
  const breakdown = calculateIncidentBreakdown(tickets, alerts);

  const total = breakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Incident Breakdown by Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
              >
                {breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  "Count",
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color, fontSize: "12px" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Total incidents: {total}
        </div>
      </CardContent>
    </Card>
  );
}
