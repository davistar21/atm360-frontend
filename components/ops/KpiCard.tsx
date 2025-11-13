import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCardProps } from "./types";

export default function KpiCard({ title, value, suffix }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          {value}
          {suffix && (
            <span className="text-lg text-muted-foreground ml-1">{suffix}</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
