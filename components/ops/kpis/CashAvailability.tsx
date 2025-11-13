"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";
import { calculateCashAvailability } from "@/lib/utils/atmMetrics";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function CashAvailability() {
  const atms = useAtmStore(selectAtms);
  const cashData = calculateCashAvailability(atms);

  // Generate trend data (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    // Deterministic variation based on day index
    const variation = ((i % 3) - 1) * 2;
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      Full: Math.max(0, Math.min(atms.length, cashData.full + variation)),
      Low: Math.max(0, Math.min(atms.length, cashData.low + variation * 0.5)),
      Empty: Math.max(
        0,
        Math.min(atms.length, cashData.empty + variation * 0.3)
      ),
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Cash Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-3xl font-bold">{cashData.percentage}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            ATMs with available cash
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <div>
              <span className="text-zenith-success font-medium">
                {cashData.full}
              </span>{" "}
              Full
            </div>
            <div>
              <span className="text-zenith-warning font-medium">
                {cashData.low}
              </span>{" "}
              Low
            </div>
            <div>
              <span className="text-zenith-danger font-medium">
                {cashData.empty}
              </span>{" "}
              Empty
            </div>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEmpty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
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
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="Full"
                stackId="1"
                stroke="#10b981"
                fill="url(#colorFull)"
              />
              <Area
                type="monotone"
                dataKey="Low"
                stackId="1"
                stroke="#f59e0b"
                fill="url(#colorLow)"
              />
              <Area
                type="monotone"
                dataKey="Empty"
                stackId="1"
                stroke="#ef4444"
                fill="url(#colorEmpty)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
