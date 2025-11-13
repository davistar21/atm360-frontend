"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";
import { calculateRegionalPerformance } from "@/lib/utils/atmMetrics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function RegionalPerformance() {
  const atms = useAtmStore(selectAtms);
  const regionalData = calculateRegionalPerformance(atms);

  const chartData = regionalData.map((region) => ({
    region: region.region,
    uptime: region.uptime,
    cashAvailability: region.cashAvailability,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Regional Performance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            No regional data available
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="region"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    iconType="square"
                  />
                  <Bar
                    dataKey="uptime"
                    fill="#bae6fd"
                    name="Uptime %"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="cashAvailability"
                    fill="#16a34a"
                    name="Cash Availability %"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Comparing key metrics across regions
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
