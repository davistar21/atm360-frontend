"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Activity, MapPin, MessageSquare, ShieldCheck } from "lucide-react";
import { LogoutIcon } from "@/components/icons";
import { useAuthStore } from "@/lib/store/authStore";
import { useIsMobile } from "@/app/hooks/use-mobile";

interface BranchSidebarProps {
  branchId: string;
}

export default function BranchSidebar({ branchId }: BranchSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  // Helper to get properly encoded branchId for URLs (only encode once)
  const getEncodedBranchId = () => {
    try {
      // If already encoded, decode first then re-encode
      const decoded = decodeURIComponent(branchId);
      return encodeURIComponent(decoded);
    } catch {
      // If not encoded, just encode it
      return encodeURIComponent(branchId);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const encodedBranchId = getEncodedBranchId();
  const navItems = [
    { href: `/branch/${encodedBranchId}`, label: "Dashboard", icon: Activity },
    { href: `/branch/${encodedBranchId}/atms`, label: "ATMs", icon: MapPin },
    { href: `/branch/${encodedBranchId}/complaints`, label: "Complaints", icon: MessageSquare },
  ];

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-3 z-50 bg-white p-2 rounded-md shadow-md"
        >
          <Menu className="w-6 h-6 text-gray-800" />
        </button>
      )}

      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black opacity-40 z-40 transition-opacity"
        />
      )}

      <aside
        className={`${
          isMobile
            ? `fixed top-0 left-0 z-50 h-full bg-white shadow-lg transform transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `relative h-screen shadow-lg`
        } w-64 fixed sm:relative top-0 left-0 z-50 h-full bg-white shadow-lg text-zenith-neutral-800 flex flex-col`}
      >
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-bold text-zenith-red-400">
            <span className="text-zenith-neutral-800">ATM</span>360
          </h1>
          {isMobile && (
            <button onClick={() => setIsOpen(false)} className="p-2">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-4 pb-4 border-b border-zenith-neutral-200">
          <p className="text-xs text-zenith-neutral-500">
            Branch: {decodeURIComponent(branchId)}
          </p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-zenith-accent-100 text-zenith-accent-700 font-medium"
                    : "text-zenith-neutral-700 hover:bg-zenith-neutral-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zenith-neutral-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-zenith-neutral-700 hover:bg-zenith-neutral-100 rounded-lg transition-colors"
          >
            <LogoutIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

