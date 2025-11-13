"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import useAtmStore, { selectGetById } from "@/lib/store/atmStore";
import useTicketStore, { selectGetById as selectTicketById } from "@/lib/store/ticketStore";
import BranchSidebar from "@/components/branch/BranchSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function BranchTicketPage() {
  const params = useParams();
  // branchId from params is already decoded by Next.js
  const branchId = params?.branchId as string;
  const ticketId = params?.ticketId as string;
  const router = useRouter();
  
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
  
  const ticket = useTicketStore(selectTicketById(ticketId));
  const atmSelector = ticket?.atmId ? selectGetById(ticket.atmId) : (() => null);
  // @ts-expect-error - selector can be undefined
  const atm = useAtmStore(atmSelector);

  const [engineerCode, setEngineerCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [workConfirmed, setWorkConfirmed] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [complaintType, setComplaintType] = useState<
    "POOR_QUALITY" | "DELAY" | "OTHER"
  >("POOR_QUALITY");
  const [eta, setEta] = useState<number | null>(null);

  // Generate verification code based on ticket ID (same logic as engineer side)
  const expectedCode = useMemo(() => {
    if (!ticket?.id) return "";
    const ticketNum = parseInt(ticket.id.replace("TKT-", "")) || 0;
    return String(Math.floor(100000 + (ticketNum % 900000))).padStart(6, "0");
  }, [ticket?.id]);

  // Check if engineer has arrived
  const engineerArrived = !!ticket?.geoValidation?.validatedAt;
  
  // Check if engineer is verified (status is IN_PROGRESS or beyond)
  const engineerVerified = ticket?.status === "IN_PROGRESS" || ticket?.status === "RESOLVED";
  
  // Check if engineer has uploaded proof
  const hasProof = !!ticket?.resolution?.proofPhotoUrl;
  
  // Check if branch has confirmed work
  const branchConfirmedWork = ticket?.status === "RESOLVED";

  // Calculate ETA (simulated - in real app would come from location tracking)
  useEffect(() => {
    if (!engineerArrived && ticket) {
      // Simulate ETA calculation
      setEta(15); // 15 minutes default
      const interval = setInterval(() => {
        setEta((prev) => (prev && prev > 1 ? prev - 1 : null));
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    } else {
      setEta(null);
    }
  }, [engineerArrived, ticket]);

  useEffect(() => {
    useTicketStore.getState().refresh();
    useAtmStore.getState().refresh();
  }, []);

  // Auto-check code when entered (only if engineer has arrived)
  useEffect(() => {
    if (engineerArrived && engineerCode.length === 6 && expectedCode) {
      if (engineerCode === expectedCode) {
        setIsVerified(true);
        toast.success("Verification code matched! Engineer verified.");
        // Update ticket to mark as verified
        if (ticket) {
          useTicketStore.getState().updateTicket(ticket.id, {
            status: "IN_PROGRESS",
          });
        }
      } else {
        toast.error("Code does not match. Please verify with the engineer.");
      }
    }
  }, [engineerCode, expectedCode, ticket, engineerArrived]);

  const handleConfirmWork = () => {
    if (!ticket) return;
    
    // Mark ticket as branch confirmed - this allows engineer to complete
    useTicketStore.getState().updateTicket(ticket.id, {
      status: "RESOLVED",
      resolution: {
        summary: ticket.resolution?.summary || "Work confirmed by branch",
        resolvedAt: ticket.resolution?.resolvedAt || new Date().toISOString(),
        timeSpentMinutes: ticket.resolution?.timeSpentMinutes || 0,
        proofPhotoUrl: ticket.resolution?.proofPhotoUrl,
      },
    });
    
    setWorkConfirmed(true);
    toast.success("Work completion confirmed! Engineer can now complete the task.");
  };

  const handleSubmitComplaint = () => {
    if (!complaintText.trim()) {
      toast.error("Please enter complaint details");
      return;
    }

    toast.success("Complaint submitted to operations team");
    setComplaintText("");
    setComplaintType("POOR_QUALITY");
  };

  if (!ticket || !atm) {
    return (
      <div className="flex h-screen bg-gray-50">
        <BranchSidebar branchId={branchId} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zenith-neutral-500">Ticket not found</p>
        </div>
      </div>
    );
  }

  const canConfirm = ticket.resolution?.proofPhotoUrl && !isVerified;

  return (
    <div className="flex h-screen bg-gray-50">
      <BranchSidebar branchId={branchId} />
      <div className="flex-1 flex flex-col space-y-6 h-screen overflow-y-auto scrollbar">
        <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <button
              onClick={() => router.push(`/branch/${getEncodedBranchId()}`)}
              className="text-zenith-accent-600 hover:text-zenith-accent-700 mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-zenith-neutral-900">
              Ticket #{ticket.id}
            </h1>
            <p className="text-sm text-zenith-neutral-600">
              {atm.location.branchName || atm.location.address}
            </p>
          </div>

          <div className="space-y-6">
            {/* Engineer Status Section */}
            {!engineerArrived && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-zenith-accent-600" />
                  <h2 className="text-xl font-semibold text-zenith-neutral-900">
                    Engineer Status
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-zenith-accent-50 rounded-lg border border-zenith-accent-200">
                    <p className="text-lg font-semibold text-zenith-accent-700 mb-2">
                      Engineer is on the way
                    </p>
                    <p className="text-sm text-zenith-accent-600">
                      {eta !== null
                        ? `Estimated arrival: ${eta} minute${eta !== 1 ? "s" : ""}`
                        : "Will be with you shortly"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Verification Code:</strong> {expectedCode}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      This code will be used to verify the engineer's identity when they arrive.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Verification Section - Only show when engineer has arrived */}
            {engineerArrived && !engineerVerified && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-zenith-accent-600" />
                  <h2 className="text-xl font-semibold text-zenith-neutral-900">
                    Verify Engineer Identity
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ Engineer has arrived at the location
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zenith-neutral-700 mb-2 block">
                      Enter Engineer's Verification Code
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code from engineer"
                      value={engineerCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setEngineerCode(value);
                      }}
                      className="font-mono text-2xl text-center tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-xs text-zenith-neutral-500 mt-2">
                      Expected code: {expectedCode} (for reference)
                    </p>
                  </div>
                  {isVerified && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">
                        Engineer verified successfully! They can now proceed with repairs.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Work Confirmation Section - Only show when engineer has uploaded proof */}
            {hasProof && engineerVerified && !branchConfirmedWork && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-zenith-neutral-900">
                    Confirm Work Completion
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 font-medium mb-2">
                      Engineer has marked the work as complete and uploaded proof.
                    </p>
                    <p className="text-xs text-yellow-600">
                      Please review and confirm that the work has been completed
                      satisfactorily. Only after your confirmation will the task be fully completed.
                    </p>
                  </div>
                  {ticket.resolution?.proofPhotoUrl && (
                    <div className="p-3 bg-zenith-neutral-50 rounded-lg">
                      <p className="text-xs text-zenith-neutral-600 mb-2">Proof of work uploaded</p>
                      <img
                        src={ticket.resolution.proofPhotoUrl}
                        alt="Proof of work"
                        className="w-full max-w-md rounded border"
                      />
                    </div>
                  )}
                  <Button
                    onClick={handleConfirmWork}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Work Completion
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Work Confirmed Section */}
            {branchConfirmedWork && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg border border-green-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-green-700">
                    Work Confirmed
                  </h2>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ You have confirmed the work completion. The task is now complete.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Complaint Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-zenith-red-600" />
                <h2 className="text-xl font-semibold text-zenith-neutral-900">
                  Log Complaint or Feedback
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zenith-neutral-700 mb-2 block">
                    Complaint Type
                  </label>
                  <select
                    value={complaintType}
                    onChange={(e) =>
                      setComplaintType(
                        e.target.value as "POOR_QUALITY" | "DELAY" | "OTHER"
                      )
                    }
                    className="w-full px-3 py-2 border border-zenith-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zenith-accent-500"
                  >
                    <option value="POOR_QUALITY">Poor Repair Quality</option>
                    <option value="DELAY">Service Delay</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-zenith-neutral-700 mb-2 block">
                    Details
                  </label>
                  <Textarea
                    placeholder="Describe the issue or provide feedback..."
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleSubmitComplaint}
                  className="w-full bg-gradient-to-r from-zenith-red-500 to-zenith-red-600 hover:from-zenith-red-600 hover:to-zenith-red-700"
                >
                  Submit to Operations Team
                </Button>
              </div>
            </motion.div>

            {/* Ticket Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-6"
            >
              <h2 className="text-xl font-semibold text-zenith-neutral-900 mb-4">
                Ticket Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zenith-neutral-600">Issue Type:</span>
                  <span className="font-medium">{ticket.issueType.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zenith-neutral-600">Severity:</span>
                  <span className="font-medium">{ticket.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zenith-neutral-600">Status:</span>
                  <span className="font-medium">{ticket.status}</span>
                </div>
                {ticket.resolution?.timeSpentMinutes && (
                  <div className="flex justify-between">
                    <span className="text-zenith-neutral-600">Repair Time:</span>
                    <span className="font-medium">{ticket.resolution.timeSpentMinutes} minutes</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

