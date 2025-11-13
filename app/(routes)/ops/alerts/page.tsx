"use client";

import { AlertList } from "@/components/ops/alerts/AlertList";

export default function AlertsPage() {
  return (
    <div
      data-guide="alert-list"
      className="bg-white rounded-lg shadow-sm border border-zenith-neutral-200 overflow-hidden h-full flex flex-col"
    >
      <AlertList />
    </div>
  );
}
