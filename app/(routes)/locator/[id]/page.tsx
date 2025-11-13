"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import {
  Clock,
  AlertCircle,
  ArrowLeft,
  Navigation,
  ChevronRight,
  Wrench,
} from "lucide-react";

import useAtmStore, { selectGetById } from "@/lib/store/atmStore";
import { haversineDistance } from "@/lib/utils/geolocation";
import { cn } from "@/lib/utils";

const AtmLocationMap = dynamic(
  () => import("@/components/locator/ATMLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-gray-500">Loading map…</div>
      </div>
    ),
  }
);


const StatusBadge = ({ status }: { status: ATM["status"] }) => {
  const config: Record<
    string,
    { color: string; label: string }
  > = {
    ONLINE: { color: "bg-green-100 text-green-700", label: "Available" },
    OFFLINE: { color: "bg-red-100 text-red-700", label: "Out of Service" },
    MAINTENANCE: {
      color: "bg-yellow-100 text-yellow-700",
      label: "Under Maintenance",
    },
    OUT_OF_CASH: { color: "bg-orange-100 text-orange-700", label: "Out of Cash" },
    UNKNOWN: { color: "bg-gray-100 text-gray-700", label: "Unknown" },
  };

  const { color, label } = config[status] ?? config.UNKNOWN;
  return (
    <span className={`${color} px-3 py-1 rounded-full text-sm font-medium`}>
      {label}
    </span>
  );
};


const cashLevelLabel = (current: number, capacity: number) => {
  const pct = (current / capacity) * 100;
  if (pct > 70) return { label: "High", color: "bg-green-500" };
  if (pct > 30) return { label: "Medium", color: "bg-yellow-500" };
  return { label: "Low", color: "bg-red-500" };
};

const estimateWait = (transactionsToday: number) => {
  // ~ 1 min per 20 transactions (simple heuristic)
  const minutes = Math.max(1, Math.round(transactionsToday / 20));
  return minutes;
};


const RepairCountdown = ({
  status,
  expectedBackOnline,
}: {
  status: ATM["status"];
  expectedBackOnline?: string; // ISO string from backend
}) => {
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!expectedBackOnline || !["MAINTENANCE", "OFFLINE"].includes(status))
      return;

    const target = new Date(expectedBackOnline).getTime();
    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setSeconds(diff);
      if (diff === 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expectedBackOnline, status]);

  if (!seconds) return null;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-2 text-sm text-orange-700">
      <Wrench className="w-4 h-4" />
      <span>
        Back online in{" "}
        {hrs > 0 && `${hrs}h `}{mins}m {secs}s
      </span>
    </div>
  );
};


export default function AtmDetailsPage() {
  const { id } = useParams();
  const atm = useAtmStore(selectGetById?.(id as string) ?? ((_: any) => null));

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // ---- Mock customer-centric data (replace with real API later) ----
  const [customerData] = useState({
    // 200-800 transactions today – realistic for a busy ATM
    transactionsToday: Math.floor(Math.random() * 600) + 200,
    // optional field from backend; fallback to 2h for demo
    expectedBackOnline: atm?.status === "MAINTENANCE"
      ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      : undefined,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        if (atm) {
          const d = haversineDistance(loc, atm.location.coordinates);
          setDistance(d);
        }
      },
      () => console.log("Location denied"),
      { enableHighAccuracy: true }
    );
  }, [atm]);

  if (!atm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              ATM Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The ATM you’re looking for doesn’t exist or has been removed.
            </p>
            <Link
              href="/locator"
              className="inline-flex items-center text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to ATM Locator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const waitMins = estimateWait(customerData.transactionsToday);
  const cashInfo = cashLevelLabel(
    atm.cashLevel.currentAmount,
    atm.cashLevel.totalCapacity
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/locator" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {atm.location.branchName}
              </h1>
              <p className="text-sm text-gray-600">{atm.location.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status + Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={atm.status} />
                <span className="text-sm text-gray-600">
                  Updated: {new Date(atm.lastUpdated).toLocaleTimeString()}
                </span>
              </div>

              {/* Repair countdown (if applicable) */}
              {["MAINTENANCE", "OFFLINE"].includes(atm.status) && (
                <div className="mb-4">
                  <RepairCountdown
                    status={atm.status}
                    expectedBackOnline={customerData.expectedBackOnline}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${cn(atm.status === "ONLINE" ? "bg-green-100" : "bg-gray-200")} flex items-center justify-center`}>
                    <Clock className={`w-5 h-5 ${cn(atm.status === "ONLINE" ? "text-green-700" : "text-gray-400")}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Cash Availability</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`w-3 h-3 rounded-full ${cn(atm.status === "ONLINE" ? cashInfo.color : "bg-gray-200")}`}
                      />
                      <span className="font-medium">{cashInfo.label}</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Wait */}
                {/* <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Est. Wait Time</p>
                    <p className="font-medium">
                      {waitMins} {waitMins === 1 ? "min" : "mins"}
                    </p>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Location & Route
                </h2>
                {distance && (
                  <span className="text-sm font-medium text-gray-700">
                    {distance.toFixed(2)} km away
                  </span>
                )}
              </div>
              <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                <AtmLocationMap
                  atm={atm}
                  userLocation={userLocation}
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (userLocation) {
                      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${atm.location.coordinates.lat},${atm.location.coordinates.lng}`;
                      window.open(url, "_blank");
                    }
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Report Issue
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}