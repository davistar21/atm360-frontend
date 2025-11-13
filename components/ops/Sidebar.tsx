"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  MapPinIcon,
  FileText,
  PanelBottomDashed,
  Settings,
  Menu,
  X,
  Banknote,
  Eye,
} from "lucide-react";
import { AtmIcon, AlertIcon, LogoutIcon } from "@/components/icons";
import { useAuthStore } from "@/lib/store/authStore";
import { useIsMobile } from "@/app/hooks/use-mobile";
import { useGuideStore } from "@/lib/store/guideStore";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { startGuide } = useGuideStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleGuideClick = () => {
    setIsOpen(false); // Close mobile menu
    startGuide();
  };

  const navItems = [
    { href: "/ops", label: "Overview", icon: AtmIcon },
    { href: "/ops/map", label: "ATMs", icon: MapPinIcon },
    { href: "/ops/activity", label: "Activity", icon: Activity },
    { href: "/ops/alerts", label: "Alerts", icon: AlertIcon },
    { href: "/ops/reports", label: "Reports", icon: FileText },
    { href: "/ops/transparency", label: "Transparency Logs", icon: Eye },
    { href: "/ops/connect-iad", label: "Connect IAD", icon: Banknote },
  ];

  const supportItems = [
    // { href: "/ops/settings", label: "Settings", icon: Settings },
    {
      href: "/ops/guide",
      label: "Guide",
      icon: PanelBottomDashed,
      action: "guide",
    },
    { href: "/ops/management", label: "Management", icon: Settings },
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

      {/* Overlay (only visible on mobile when sidebar is open) */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black opacity-40 z-40 transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`${
          isMobile
            ? `fixed top-0 left-0 z-50 h-full bg-white shadow-lg transform transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `relative h-screen shadow-lg`
        } w-64 
        fixed sm:relative rounded-r-4xl top-0 left-0 z-50 h-full bg-white shadow-lg text-zenith-neutral-800 flex flex-col transform transition-transform duration-300 sm:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
        data-guide="sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-bold text-zenith-red-400">
            <span className="text-zenith-neutral-800">ATM</span>360
          </h1>

          {/* Close button on mobile */}
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isMobile) setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-zenith-red-500 text-white"
                    : "hover:bg-zenith-neutral-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Support Section */}
          <div className="mt-8">
            <h2 className="px-6 text-xs font-bold text-zenith-neutral-400 uppercase mb-2">
              Support
            </h2>
            <div className="flex flex-col">
              {supportItems.map((item) => {
                const Icon = item.icon;
                if (item.action === "guide") {
                  return (
                    <button
                      key={item.label}
                      onClick={handleGuideClick}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-zenith-neutral-600 hover:bg-zenith-neutral-200 w-full text-left"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-zenith-neutral-600 hover:bg-zenith-neutral-200"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer (User info + Logout) */}
        <div className="p-4">
          <div className="mb-3 px-4 py-2">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
