"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export function TopNav() {
  const { user, logout } = useAuthStore(); // <-- add logout from your store
  const pathname = usePathname();

  // ── Page title logic ─────────────────────────────────────
  const title = useMemo(() => {
    const map: Record<string, string> = {
      "/ops": "Overview",
      "/ops/map": "ATM Map",
      "/ops/activity": "ATM Activity",
      "/ops/alerts": "ATM Alerts",
      "/ops/reports": "ATM Reports",
      "/ops/guide": "Operations Guide",
      "/ops/settings": "Settings",
      "/ops/connect-iad": "Connect IAD",
      "/ops/transparency": "Transparency Logs",
    };
    return map[pathname] ?? "Welcome";
  }, [pathname]);

  // ── Logout handler ───────────────────────────────────────
  const handleLogout = () => {
    logout?.(); // call your store’s logout (clears user, token, etc.)
    // optional: redirect
    // router.push('/login');
  };

  return (
    <div
      data-guide="top-nav"
      className="h-16 border-b mx-10 border-zenith-neutral-200 flex items-center justify-between"
    >
      {/* Page title */}
      <h2 className="text-xl font-bold text-zenith-neutral-900">{title}</h2>

      {/* ── Avatar + Dropdown ───────────────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 focus:outline-none">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-zenith-neutral-900">
                {user?.name}
              </p>
              <p className="text-xs text-zenith-neutral-500">Administrator</p>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zenith-red-400 to-zenith-red-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {/* Header */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email ?? "admin@example.com"}
              </p>
            </div>
          </DropdownMenuLabel>

          {/* Logout */}
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onSelect={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
