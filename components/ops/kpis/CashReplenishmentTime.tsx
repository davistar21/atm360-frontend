"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";
import { calculateCashReplenishmentTime } from "@/lib/utils/atmMetrics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function CashReplenishmentTime() {
  const atms = useAtmStore(selectAtms);
  const avgTime = calculateCashReplenishmentTime(atms);

  // Generate trend data (last 14 days)
  const baseTime = avgTime || 120; // Default to 120 minutes if no data
  const trendData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    // Simulate improving trend
    const daysAgo = 13 - i;
    const improvement = daysAgo * 2;
    const variation = ((i % 4) - 1.5) * 8; // Deterministic variation
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      time: Math.max(60, baseTime - improvement + variation),
    };
  });

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Avg. Time to Cash Replenishment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-3xl font-bold">{formatTime(avgTime)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Average replenishment time
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10 }} />
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
                dataKey="time"
                stroke="#E3000F"
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
