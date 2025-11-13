// /components/transparency/TransparencySummary.tsx
import { Card, CardContent } from "@/components/ui/card";
import { type TransparencyStats } from "@/lib/store/transparencyStore";

export function TransparencySummary({ stats }: { stats: TransparencyStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-500">Total Logs</h4>
          <p className="text-2xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>
      {Object.entries(stats.bySeverity).map(([key, val]) => (
        <Card key={key}>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-gray-500 capitalize">
              {key}
            </h4>
            <p className="text-2xl font-bold">{val}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
