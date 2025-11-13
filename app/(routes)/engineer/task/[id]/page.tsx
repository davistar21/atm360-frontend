"use client";
import TaskDetail from "./TaskDetail";
import { useParams } from "next/navigation";

export default function TaskDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  return <TaskDetail ticketId={id} />;
}
