"use client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/ops/Sidebar";
import { TopNav } from "@/components/ops/TopNav";
import { GuideTour } from "@/components/guide/GuideTour";
import ZeniPanel from "@/components/chatbot/zeniPanel";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col space-y-6 h-screen overflow-y-auto scrollbar">
          <TopNav />

          <GuideTour />
          <div className="flex-1 p-4">{children}</div>
          {/* <ZeniPanel /> */}
        </div>
      </div>
    </ProtectedRoute>
  );
}
