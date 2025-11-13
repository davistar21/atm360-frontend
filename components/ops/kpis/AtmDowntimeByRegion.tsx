"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";
import { calculateDowntimeByRegion } from "@/lib/utils/atmMetrics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function AtmDowntimeByRegion() {
  const atms = useAtmStore(selectAtms);
  const regionData = calculateDowntimeByRegion(atms);

  const getColor = (downtime: number) => {
    if (downtime >= 50) return "#81110b"; // red
    if (downtime >= 25) return "#075985"; // amber
    if (downtime >= 10) return "#81110b"; // yellow
    return "#10b981"; // green
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          ATM Downtime by Region
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis
                dataKey="region"
                type="category"
                width={80}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
                labelFormatter={(label) => `Region: ${label}`}
              />
              <Bar dataKey="downtime" radius={[0, 4, 4, 0]}>
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.downtime)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Showing downtime percentage by state
        </div>
      </CardContent>
    </Card>
  );
}
