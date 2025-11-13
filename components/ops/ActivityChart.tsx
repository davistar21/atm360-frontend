"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";
import { useTicketStore, selectTickets } from "@/lib/store/ticketStore";

export default function ActivityChart() {
  const atms = useAtmStore(selectAtms);
  const tickets = useTicketStore(selectTickets);

  // Generate activity data based on real data - transactions per month (simulated from ATM status changes)
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();

  // Calculate activity based on online ATMs and resolved tickets
  const onlineAtms = atms?.filter((a) => a.status === "ONLINE").length;
  const resolvedTickets = tickets?.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;

  const data = months.map((month, index) => {
    // Base activity on online ATMs (more ATMs = more activity)
    // Add some variation for past months to show trend
    const baseActivity = onlineAtms * 50;
    const variation = index <= currentMonth ? (currentMonth - index) * 10 : 0;
    const ticketActivity = resolvedTickets * 5;
    // Use a deterministic variation based on index instead of random
    const deterministicVariation = ((index % 3) - 1) * 15;

    return {
      month,
      value: Math.max(
        0,
        baseActivity + variation + ticketActivity + deterministicVariation
      ),
    };
  });

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Monthly Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [Math.round(value), "Activity"]}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
