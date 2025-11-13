"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";
import { calculateTopAtmsByVolume } from "@/lib/utils/atmMetrics";
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

export function TopAtmsByVolume() {
  const atms = useAtmStore(selectAtms);
  const topAtms = calculateTopAtmsByVolume(atms);

  const chartData = topAtms.map((atm) => ({
    name: atm.atmId.replace("ATM-", ""),
    volume: atm.volume,
    location: atm.location,
  }));

  const colors = ["#E3000F", "#868786", "#4A4A4A", "#F5F5F5", "#D9D9D9"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Top 10 ATMs by Transaction Volume
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            No ATM data available
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={60}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Volume"]}
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload;
                      return data?.location || label;
                    }}
                  />
                  <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Based on uptime percentage (proxy metric)
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
