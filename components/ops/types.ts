// Shared types
export type SparklineData = { value: number }[];

export interface KnowledgeCardProps {
  title: string;
  value: number; // 0-100
  data: SparklineData;
  trend?: "up" | "down" | "flat";
}

export interface KpiCardProps {
  title: string;
  value: string | number;
  suffix?: string;
}

export interface TopicItem {
  icon?: React.ReactNode;
  name: string;
  percent: number;
  color: string;
}
