"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateFraudDetectionRate } from "@/lib/utils/atmMetrics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function FraudDetectionRate() {
  const fraudData = calculateFraudDetectionRate();

  // Aggregate by week for better visualization
  const weeklyData = Array.from({ length: 4 }, (_, weekIndex) => {
    const weekStart = weekIndex * 7;
    const weekData = fraudData.slice(weekStart, weekStart + 7);
    return {
      week: `Week ${weekIndex + 1}`,
      detected: Math.round(
        weekData.reduce((sum, d) => sum + d.detected, 0) / weekData.length
      ),
      prevented: Math.round(
        weekData.reduce((sum, d) => sum + d.prevented, 0) / weekData.length
      ),
    };
  });

  const totalDetected = fraudData.reduce((sum, d) => sum + d.detected, 0);
  const totalPrevented = fraudData.reduce((sum, d) => sum + d.prevented, 0);
  const preventionRate =
    totalDetected > 0 ? Math.round((totalPrevented / totalDetected) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Fraud Detection Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-3xl font-bold">{preventionRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            Prevention rate (last 30 days)
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <div>
              <span className="text-blue-600 font-medium">{totalDetected}</span>{" "}
              Detected
            </div>
            <div>
              <span className="text-green-600 font-medium">
                {totalPrevented}
              </span>{" "}
              Prevented
            </div>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="detected"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Detected"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="prevented"
                stroke="#10b981"
                strokeWidth={2}
                name="Prevented"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
