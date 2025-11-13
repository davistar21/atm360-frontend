"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TopicItem } from "./types";

const weak: TopicItem[] = [
  { name: "Branch 42 - Main St", percent: 74, color: "bg-orange-500" },
  { name: "Branch 18 - Downtown", percent: 52, color: "bg-red-500" },
  { name: "Branch 95 - Airport", percent: 36, color: "bg-red-600" },
];

const strong: TopicItem[] = [
  { name: "Branch 01 - HQ", percent: 95, color: "bg-green-500" },
  { name: "Branch 27 - Mall", percent: 92, color: "bg-green-500" },
  { name: "Branch 63 - Uni", percent: 89, color: "bg-green-400" },
];

function TopicRow({ item }: { item: TopicItem }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-gray-200 border-2 border-dashed rounded-xl" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{item.name}</p>
        <Progress
          value={item.percent}
          className={`h-3 [&>div]:${item.color}`}
        />
      </div>
      <span className="text-sm font-medium">{item.percent}%</span>
    </div>
  );
}

export default function TopicList() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Weakest ATMs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weak.map((item, i) => (
            <TopicRow key={i} item={item} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strongest ATMs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {strong.map((item, i) => (
            <TopicRow key={i} item={item} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
