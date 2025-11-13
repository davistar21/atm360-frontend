"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { motion } from "framer-motion";
import {
  MapPin,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import useAtmStore, { selectAtms } from "@/lib/store/atmStore";
import useTicketStore from "@/lib/store/ticketStore";
import BranchSidebar from "@/components/branch/BranchSidebar";

export default function BranchPage() {
  const params = useParams();
  // branchId from params is already decoded by Next.js
  const branchId = params?.branchId as string;
  const router = useRouter();
  const atms = useAtmStore(selectAtms) ?? [];
  
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

  // Decode branchId (handles spaces and special characters)
  const decodedBranchId = useMemo(() => {
    try {
      return decodeURIComponent(branchId || "");
    } catch {
      return branchId || "";
    }
  }, [branchId]);

  // Get ATMs for this branch - filter by branchName matching branchId
  const branchAtms = useMemo(() => {
    if (!decodedBranchId) return [];
    // Match branchId with branchName (case-insensitive, handles spaces)
    return atms.filter((atm) => {
      const branchName = atm.location.branchName || "";
      const normalizedBranchName = branchName.toLowerCase().trim();
      const normalizedBranchId = decodedBranchId.toLowerCase().trim();
      
      // Check if branchId matches full branchName or the location part after " - "
      return normalizedBranchName === normalizedBranchId ||
        normalizedBranchName.includes(normalizedBranchId) ||
        normalizedBranchId.includes(normalizedBranchName.split(" - ")[1] || "") ||
        normalizedBranchName.split(" - ")[1]?.toLowerCase() === normalizedBranchId;
    });
  }, [atms, decodedBranchId]);

  // Get active tickets for branch ATMs
  const activeTickets = useMemo(() => {
    const allTickets: Ticket[] = [];
    branchAtms.forEach((atm) => {
      const tickets = useTicketStore.getState().getByAtmId(atm.id);
      allTickets.push(...tickets);
    });
    return allTickets.filter(
      (t) => t.status !== "RESOLVED" && t.status !== "CLOSED"
    );
  }, [branchAtms]);

  useEffect(() => {
    useAtmStore.getState().refresh();
    useTicketStore.getState().refresh();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "bg-green-100 text-green-700 border-green-200";
      case "OFFLINE":
        return "bg-red-100 text-red-700 border-red-200";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "OUT_OF_CASH":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <BranchSidebar branchId={branchId} />
      <div className="flex-1 flex flex-col space-y-6 h-screen overflow-y-auto scrollbar">
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zenith-neutral-900">
              Branch Dashboard
            </h1>
            <p className="text-sm text-zenith-neutral-600">
              {branchAtms[0]?.location.branchName || `Branch: ${decodedBranchId}`}
            </p>
          </div>

          {/* Active Tickets Only */}
          <div className="space-y-4">
            {activeTickets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-8 text-center">
                <p className="text-zenith-neutral-500">
                  No active service requests
                </p>
                <p className="text-sm text-zenith-neutral-400 mt-2">
                  Active tickets will appear here when engineers are assigned
                </p>
              </div>
            ) : (
              activeTickets.map((ticket) => {
                const ticketAtm = branchAtms.find((a) => a.id === ticket.atmId);
                const isArrived = ticket.geoValidation?.validatedAt;
                const isVerified = ticket.status === "IN_PROGRESS" || ticket.status === "RESOLVED";
                const hasProof = !!ticket.resolution?.proofPhotoUrl;
                const branchConfirmed = ticket.status === "RESOLVED";

                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => router.push(`/branch/${getEncodedBranchId()}/ticket/${ticket.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-zenith-neutral-900 mb-1">
                          Ticket #{ticket.id}
                        </h3>
                        <p className="text-sm text-zenith-neutral-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {ticketAtm?.location.address || "ATM Location"}
                        </p>
                        <p className="text-xs text-zenith-neutral-500 mt-1">
                          {ticket.issueType.replace("_", " ")} - {ticket.severity}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border font-medium ${
                          ticket.severity === "CRITICAL"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : ticket.severity === "HIGH"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {ticket.severity}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-zenith-accent-50 rounded-lg border border-zenith-accent-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-zenith-accent-600" />
                          <div>
                            <p className="text-sm text-zenith-accent-700 font-medium">
                              {!isArrived
                                ? "Engineer is on the way"
                                : !isVerified
                                ? "Engineer arrived - Awaiting verification"
                                : hasProof && !branchConfirmed
                                ? "Work completed - Awaiting your confirmation"
                                : "Service in progress"}
                            </p>
                            {!isArrived && (
                              <p className="text-xs text-zenith-accent-600 mt-1">
                                Estimated arrival: ~15 minutes
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/branch/${getEncodedBranchId()}/ticket/${ticket.id}`);
                          }}
                          className="text-xs px-4 py-2 bg-zenith-accent-600 text-white rounded hover:bg-zenith-accent-700 font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

