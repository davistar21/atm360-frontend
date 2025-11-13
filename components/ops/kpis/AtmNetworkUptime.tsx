"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";
import { calculateNetworkUptime } from "@/lib/utils/atmMetrics";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function AtmNetworkUptime() {
  const atms = useAtmStore(selectAtms);
  const uptime = calculateNetworkUptime(atms);

  // Data for gauge chart (pie chart styled as gauge)
  const data = [
    { name: "Uptime", value: uptime, color: "#16a34a" },
    { name: "Downtime", value: 100 - uptime, color: "#e5e7eb" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          ATM Network Uptime
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={64}
                  startAngle={180}
                  endAngle={0}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{uptime}%</div>
                <div className="text-xs text-muted-foreground">Online</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {atms.filter((a) => a.status === "ONLINE").length} of {atms.length}{" "}
          ATMs operational
        </div>
      </CardContent>
    </Card>
  );
}
