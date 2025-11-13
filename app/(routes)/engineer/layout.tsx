"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function EngineerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["engineer"]}>{children}</ProtectedRoute>
  );
}
