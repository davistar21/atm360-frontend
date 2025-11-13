"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";
import { useTicketStore, selectTickets } from "@/lib/store/ticketStore";
import { calculateRecurringFaults } from "@/lib/utils/atmMetrics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
  ComposedChart,
} from "recharts";

export function RecurringFaults() {
  const atms = useAtmStore(selectAtms);
  const tickets = useTicketStore(selectTickets);
  const faults = calculateRecurringFaults(atms, tickets);

  // Calculate cumulative percentage for Pareto chart
  const totalFaults = faults.reduce((sum, f) => sum + f.faultCount, 0);
  let cumulative = 0;
  const chartData = faults.map((fault, index) => {
    cumulative += fault.faultCount;
    return {
      name: fault.atmId.replace("ATM-", ""),
      faults: fault.faultCount,
      cumulative: Math.round((cumulative / totalFaults) * 100),
      location: fault.location,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Recurring Faults
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            No fault data available
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "cumulative")
                        return [`${value}%`, "Cumulative %"];
                      return [value, "Faults"];
                    }}
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload;
                      return data?.location || label;
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="faults"
                    fill="#ef4444"
                    name="Faults"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Cumulative %"
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Top {faults.length} ATMs with most recurring faults (80/20 rule)
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
