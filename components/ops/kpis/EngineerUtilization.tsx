"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTicketStore, selectTickets } from "@/lib/store/ticketStore";
import { calculateEngineerUtilization } from "@/lib/utils/atmMetrics";
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

export function EngineerUtilization() {
  const tickets = useTicketStore(selectTickets);
  const utilization = calculateEngineerUtilization(tickets);

  const chartData = utilization.map((eng) => ({
    engineer: eng.engineerId.replace("ENG-", "E"),
    resolved: eng.resolved,
    inProgress: eng.inProgress,
    total: eng.totalTasks,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Engineer Utilization Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No engineer data available
          </div>
        ) : (
          <>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="engineer" tick={{ fontSize: 10 }} />
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
                    iconType="square"
                  />
                  <Bar
                    dataKey="resolved"
                    stackId="a"
                    fill="#10b981"
                    name="Resolved"
                  />
                  <Bar
                    dataKey="inProgress"
                    stackId="a"
                    fill="#f59e0b"
                    name="In Progress"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              {utilization.length} engineer(s) with active tasks
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
