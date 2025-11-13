import {
  type TransparencyLog,
  type Severity,
  type LogType,
} from "@/lib/store/transparencyStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

type SeverityCounts = {
  date: string;
} & {
  [key in Severity]: number;
};

export function TransparencyCharts({ logs }: { logs: TransparencyLog[] }) {
  const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6", "#ae04ae"];

  // ✅ Properly typed accumulator
  const dataOverTime = logs.reduce<Record<string, SeverityCounts>>(
    (acc, log) => {
      const date = new Date(log.timestamp).toLocaleDateString();

      if (!acc[date]) {
        acc[date] = {
          date,
          info: 0,
          warning: 0,
          error: 0,
          critical: 0,
        };
      }

      const severity: Severity = log.severity ?? "info";
      acc[date][severity] += 1;

      return acc;
    },
    {}
  );

  const timeSeries = Object.values(dataOverTime);

  // ✅ Also typed for LogType
  const byType = Object.entries(
    logs.reduce<Record<LogType, number>>((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {} as Record<LogType, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold mb-3">Logs Over Time</h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timeSeries}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="info" stroke="#22c55e" />
            <Line dataKey="warning" stroke="#eab308" />
            <Line dataKey="error" stroke="#ef4444" />
            <Line dataKey="critical" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold mb-3">Logs by Type</h4>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={byType}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {byType.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
