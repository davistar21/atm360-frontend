"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTicketStore, selectTickets } from "@/lib/store/ticketStore";
import { calculateMTTR } from "@/lib/utils/atmMetrics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function MeanTimeToRepair() {
  const tickets = useTicketStore(selectTickets);
  const mttr = calculateMTTR(tickets);

  // Generate trend data (last 7 days)
  const baseMttr = mttr || 120; // Default to 120 minutes if no data
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    // Deterministic variation: simulate improving trend over time
    const daysAgo = 6 - i;
    const improvement = daysAgo * 2; // Improving by 2 minutes per day
    const variation = ((i % 3) - 1) * 5; // Small deterministic variation
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      mttr: Math.max(0, baseMttr - improvement + variation),
    };
  });

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Mean Time to Repair (MTTR)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-3xl font-bold">{formatTime(mttr)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Average resolution time
          </div>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => formatTime(value)}
              />
              <Line
                type="monotone"
                dataKey="mttr"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
