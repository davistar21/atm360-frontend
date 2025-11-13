"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTicketStore, selectTickets } from "@/lib/store/ticketStore";
import { calculateSLACompliance } from "@/lib/utils/atmMetrics";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function SLACompliance() {
  const tickets = useTicketStore(selectTickets);
  const slaData = calculateSLACompliance(tickets);

  // Data for gauge chart
  const data = [
    { name: "Compliant", value: slaData.compliant, color: "#10b981" },
    { name: "Breached", value: slaData.breached, color: "#ef4444" },
  ];

  const total = slaData.compliant + slaData.breached;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          SLA Compliance
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [
                    `${value} (${
                      total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    }%)`,
                    "Incidents",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{slaData.percentage}%</div>
                <div className="text-xs text-muted-foreground">Compliant</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center space-y-1">
          <div className="text-sm">
            <span className="text-green-600 font-medium">
              {slaData.compliant}
            </span>{" "}
            compliant
          </div>
          <div className="text-sm">
            <span className="text-red-600 font-medium">{slaData.breached}</span>{" "}
            breached
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {total} total resolved incidents
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
