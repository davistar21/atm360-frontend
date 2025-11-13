// app/not-found.tsx
"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/ops/Sidebar";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* ── Sidebar (fixed width) ── */}
      <Sidebar />

      {/* ── Main 404 content (centered) ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-6xl font-bold text-zenith-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
          Sorry, we couldn’t find the page you’re looking for. It might have
          been removed, renamed, or doesn’t exist anymore.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg bg-zenith-red-500 text-white font-medium hover:bg-zenith-red-600 transition-colors"
        >
          Go Back
        </button>
      </main>
    </div>
  );
}
