"use client";

import React, { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAtmStore,
  selectGetById as selectAtmById,
} from "@/lib/store/atmStore";
import useTicketStore, {
  selectGetById as selectTicketById,
} from "@/lib/store/ticketStore";

import ArrivalBanner from "@/components/engineer/ArrivalBanner";
import ArrivalMap from "@/components/engineer/ArrivalMap";
import VerificationPanel from "@/components/engineer/VerificationPanel";
import TaskSummaryCard from "@/components/engineer/TaskSummaryCard";
import Checklist from "@/components/engineer/Checklist";
import SupportPanel from "@/components/engineer/SupportPanel";
import useFeedback from "@/lib/utils/useFeedback";
import { toast } from "sonner";
import UploadProof from "../[id]/UploadProof";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useTransparencyStore } from "@/lib/store/transparencyStore";
import { useAuthStore } from "@/lib/store/authStore";
import MultiStepProgress from "@/components/engineer/MultiStepProgress";
import sendWhatsAppMessage from "@/lib/utils/sendWhatsappMessage";
import { CheckCircle, Clock, MapPin } from "lucide-react";
interface TaskDetailProps {
  ticketId: string;
}
const TaskDetail: React.FC<TaskDetailProps> = ({ ticketId }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const ticket = useTicketStore(selectTicketById(ticketId));
  const atmSelector = ticket?.atmId ? selectAtmById(ticket.atmId) : () => null;
  // @ts-expect-error ignore
  const atm = useAtmStore(atmSelector);
  const { addLog } = useTransparencyStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [verified, setVerified] = useState(false);
  const [repairStarted, setRepairStarted] = useState(false);
  const [repairStartTime, setRepairStartTime] = useState<Date | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const { vibrate, playArrivalSound } = useFeedback();
  const [activeStep, setActiveStep] = useState(0);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [branchConfirmed, setBranchConfirmed] = useState(false);

  // Generate verification code when task is loaded (deterministic based on ticket ID)
  useEffect(() => {
    if (ticket && !verificationCode) {
      // Generate a deterministic 6-digit code based on ticket ID
      // This ensures both engineer and branch generate the same code
      const ticketNum = parseInt(ticket.id.replace("TKT-", "")) || 0;
      const code = String(Math.floor(100000 + (ticketNum % 900000))).padStart(6, "0");
      setVerificationCode(code);
    }
  }, [ticket, verificationCode]);

  useEffect(() => {
    let step = 0;
    if (!arrived) step = 0;
    else if (arrived && !verified) step = 1;
    else if (verified && !repairStarted) step = 2;
    else if (repairStarted && !ticket?.resolution?.proofPhotoUrl) step = 2; // Still repair
    else if (
      ticket?.resolution?.proofPhotoUrl &&
      !(ticket?.status === "RESOLVED")
    )
      step = 3;

    if (ticket?.status === "RESOLVED") step = 4;
    setActiveStep(step);
  }, [arrived, verified, repairStarted, ticket]);
  const [checklist, setChecklist] = useState([
    { id: "validate", label: "Arrival at ATM location", done: true },
    { id: "verify", label: "On-site Verification", done: true },
    { id: "repair", label: "Perform repair", done: false },
    { id: "proof", label: "Upload proof photo", done: false },
    { id: "complete", label: "Mark complete", done: false },
  ]);

  // Load mock data
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        await Promise.all([
          useTicketStore.getState().refresh(),
          useAtmStore.getState().refresh(),
        ]);
        addLog({
          type: "system-event",
          details: `Loaded task detail for Ticket #${ticketId}`,
          severity: "info",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    return () => {
      mounted = false;
    };
  }, [ticketId]);

  // Haversine Distance Helper
  function distanceBetween(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Get user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      // Fallback for demo
      if (atm?.location.coordinates) {
        setUserLocation({
          lat: atm.location.coordinates.lat - 0.01,
          lng: atm.location.coordinates.lng - 0.01,
        });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Fallback for demo if location denied
        if (atm?.location.coordinates) {
          setUserLocation({
            lat: atm.location.coordinates.lat - 0.01,
            lng: atm.location.coordinates.lng - 0.01,
          });
        }
      },
      { enableHighAccuracy: true }
    );
  }, [atm]);

  const handleArrived = () => {
    if (!arrived && atm && ticket) {
      setArrived(true);
      useTicketStore.getState().updateTicket(ticket.id, {
        geoValidation: {
          engineerLat: userLocation?.lat || 0,
          engineerLng: userLocation?.lng || 0,
          validatedAt: new Date().toISOString(),
        },
      });
      addLog({
        type: "user-action",
        details: `Engineer arrived at ATM #${atm.id} (distance ≤ 50m)`,
        severity: "info",
        user: { role: "engineer", id: user?.id },
      });
      toast.success("Arrival confirmed! Waiting for branch verification...");
    }
  };

  // Check if branch has verified (ticket status becomes IN_PROGRESS)
  useEffect(() => {
    if (arrived && ticket?.status === "IN_PROGRESS" && !verified) {
      setVerified(true);
      setRepairStarted(true);
      setRepairStartTime(new Date());
      addLog({
        type: "user-action",
        details: `Branch verified engineer for Ticket #${ticket.id}`,
        severity: "info",
        user: { role: "engineer", id: user?.id },
      });
      vibrate();
      toast.success("Verification successful! You can now proceed with repairs.");
    }
  }, [arrived, ticket?.status, verified, ticket?.id, user?.id, vibrate, addLog]);

  const handleProofUpload = async (base64: string) => {
    if (!ticket || !repairStartTime) return;
    setActionLoading(true);
    try {
      const timeSpent = Math.floor(
        (new Date().getTime() - repairStartTime.getTime()) / 60000
      );
      useTicketStore.getState().updateTicket(ticket.id, {
        resolution: {
          ...(ticket.resolution || {}),
          proofPhotoUrl: base64,
          summary: ticket.resolution?.summary ?? "Proof uploaded",
          resolvedAt: ticket.resolution?.resolvedAt ?? new Date().toISOString(),
          timeSpentMinutes: timeSpent,
        },
      });
      localStorage.setItem(`ticket-proof-${ticket.id}`, base64);
      setChecklist((prev) =>
        prev.map((c) => (c.id === "proof" ? { ...c, done: true } : c))
      );
      toast.success("Proof uploaded. Waiting for branch confirmation...");
      addLog({
        type: "user-action",
        details: `Proof photo uploaded for Ticket #${ticket.id}`,
        severity: "info",
        user: { role: "engineer", id: user?.id },
        meta: { proofLength: base64.length },
      });
      
      // Don't auto-confirm - wait for branch to actually confirm
      // Branch confirmation will update ticket status to RESOLVED
    } catch {
      setError("Failed to upload proof.");
      toast.error("Failed to upload proof.");
      addLog({
        type: "error",
        details: `Failed to upload proof for Ticket #${ticket.id}`,
        severity: "error",
        user: { role: "engineer", id: user?.id },
      });
    } finally {
      setActionLoading(false);
    }
  };
  // Check if branch has confirmed work (ticket status becomes RESOLVED)
  useEffect(() => {
    if (ticket?.status === "RESOLVED" && !branchConfirmed) {
      setBranchConfirmed(true);
      toast.success("Branch has confirmed work completion!");
    }
  }, [ticket?.status, branchConfirmed]);

  async function handleMarkComplete() {
    if (!ticket || !repairStartTime) return;
    const proofUrl =
      ticket.resolution?.proofPhotoUrl ??
      localStorage.getItem(`ticket-proof-${ticket.id}`);
    if (!proofUrl) {
      toast.error("Please upload proof before completing the task.");
      addLog({
        type: "error",
        details: `Upload of proof of fix failed for ticket ${ticket.id}`,
        severity: "error",
      });
      return;
    }

    if (!branchConfirmed) {
      toast.error("Please wait for branch confirmation before completing.");
      return;
    }

    setActionLoading(true);
    try {
      const timeSpent = Math.floor(
        (new Date().getTime() - repairStartTime.getTime()) / 60000
      );
      // Ticket is already RESOLVED by branch, just update final details
      useTicketStore.getState().updateTicket(ticket.id, {
        resolution: {
          ...(ticket.resolution || {}),
          summary: "Issue resolved successfully",
          resolvedAt: new Date().toISOString(),
          timeSpentMinutes: timeSpent,
          proofPhotoUrl: proofUrl,
        },
      });
      setChecklist((prev) =>
        prev.map((c) => (c.id === "complete" ? { ...c, done: true } : c))
      );
      addLog({
        type: "user-action",
        details: `Engineer completed Ticket #${ticket.id}. Total time: ${timeSpent} minutes`,
        severity: "info",
        user: { role: "engineer", id: user?.id },
      });
      toast.success("Task completed!");
    } catch {
      toast.error("Failed to mark complete.");
      addLog({
        type: "error",
        details: `Failed to mark Ticket #${ticket.id} as complete.`,
        severity: "error",
        user: { role: "engineer", id: user?.id },
      });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-6">
        {/* Wrap with motion.div for staggered animation */}
        <motion.div
          className="flex flex-col gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.3 } },
          }}
        >
          {/* Repeat the skeleton items (3) */}
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="min-w-[300px] h-56 flex flex-col gap-4"
            >
              {/* Main skeleton element */}
              <Skeleton className="h-24 w-full animate-pulse" />

              {/* Skeleton for user details */}
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-full animate-pulse" />
                  <Skeleton className="h-3 w-full animate-pulse" />
                  <Skeleton className="h-3 w-full animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    );

  if (!ticket || !atm) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center text-red-500">
        <div className="max-w-lg p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-red-600">
            Task Not Found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            It seems the task you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>

          <div className="mt-6">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-zenith-accent-600 text-white rounded-lg hover:bg-zenith-accent-500 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }
  const steps = [
    "Arrival",
    "Verification",
    "Repair",
    "Proof Upload",
    "Completion",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zenith-neutral-50 to-zenith-accent-50">
      <Header title={`Task #${ticket.id}`} subtitle="Engineer Workflow" />
      <MultiStepProgress steps={steps} activeStep={activeStep} />
      <main className="flex flex-col md:flex-row gap-6 items-center md:items-start max-w-6xl mx-auto px-4 py-6">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {!arrived && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 80, animationDuration: 0.6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -80, animationDuration: 0.8 }}
                className="w-full"
              >
                <ArrivalBanner arrived={arrived} distance={distance} />
                {atm && userLocation && (
                  <div className="mt-4">
                    <ArrivalMap
                      userLocation={userLocation}
                      atmLocation={atm.location.coordinates}
                      onDistanceUpdate={setDistance}
                      onArrival={handleArrived}
                    />
                  </div>
                )}
                {/* Skip/Arrived button for demo */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleArrived}
                    className="w-full px-6 py-3 bg-gradient-to-r from-zenith-accent-500 to-zenith-accent-600 text-white rounded-lg hover:from-zenith-accent-600 hover:to-zenith-accent-700 transition-all font-medium shadow-lg"
                  >
                    Mark as Arrived (Skip for Demo)
                  </button>
                  <p className="text-xs text-center text-zenith-neutral-500">
                    In production, arrival is detected automatically when within 50m
                  </p>
                </div>
              </motion.div>
            )}

            {arrived && !verified && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full"
              >
                <div className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-6">
                  <VerificationPanel
                    code={verificationCode}
                    onVerified={() => {}} // Verification happens on branch side
                  />
                  <div className="mt-4 p-4 bg-zenith-accent-50 rounded-lg border border-zenith-accent-200">
                    <p className="text-sm text-zenith-accent-700 font-medium">
                      Waiting for branch staff to verify your code...
                    </p>
                    <p className="text-xs text-zenith-accent-600 mt-1">
                      Share code <strong>{verificationCode}</strong> with branch staff. They will verify it matches their system.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {verified && ticket?.status !== "RESOLVED" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-4"
              >
                {/* Repair Timer */}
                {repairStarted && repairStartTime && (
                  <div className="bg-white rounded-lg shadow-lg border border-zenith-accent-200 p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-zenith-accent-600" />
                      <div>
                        <p className="text-sm text-zenith-neutral-500">
                          Repair Time
                        </p>
                        <p className="text-lg font-semibold text-zenith-accent-700">
                          {Math.floor(
                            (new Date().getTime() - repairStartTime.getTime()) /
                              60000
                          )}{" "}
                          minutes
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Checklist checklist={checklist} setChecklist={setChecklist} />
                <UploadProof onSuccess={handleProofUpload} />
                {ticket.resolution?.proofPhotoUrl && (
                  <section className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-4">
                    <h3 className="text-lg font-semibold mb-2">Uploaded Proof</h3>
                    <div className="mt-2">
                      <Image
                        src={ticket.resolution.proofPhotoUrl}
                        alt="Proof Photo"
                        width={400}
                        height={300}
                        className="rounded border w-full max-w-md"
                      />
                    </div>
                    {!branchConfirmed && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700 font-medium">
                          Waiting for branch confirmation...
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Branch staff must review and confirm the work before you can complete the task.
                        </p>
                      </div>
                    )}
                    {branchConfirmed && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-green-700 font-medium">
                            Branch confirmed work completion
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            You can now mark the task as complete.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {ticket.resolution?.proofPhotoUrl && (
                  <div className="space-y-3">
                    {!branchConfirmed && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700 font-medium">
                          Waiting for branch confirmation...
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Branch staff must confirm the work completion before you can finish the task.
                        </p>
                      </div>
                    )}
                    {branchConfirmed && (
                      <button
                        onClick={handleMarkComplete}
                        disabled={actionLoading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-zenith-accent-500 to-zenith-accent-600 text-white rounded-lg hover:from-zenith-accent-600 hover:to-zenith-accent-700 transition-all font-medium shadow-lg disabled:opacity-60"
                      >
                        {actionLoading ? "Completing..." : "Mark Task Complete"}
                      </button>
                    )}
                  </div>
                )}
                <SupportPanel />
              </motion.div>
            )}

            {ticket?.status === "RESOLVED" && (
              <motion.div
                key="completion"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-8 text-center"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-zenith-neutral-900 mb-2">
                  Task Completed! 🎉
                </h2>
                <p className="text-zenith-neutral-600 mb-6">
                  Great work! The task has been successfully completed.
                </p>
                {repairStartTime && ticket.resolution && (
                  <div className="mb-6 p-4 bg-zenith-accent-50 rounded-lg">
                    <p className="text-sm text-zenith-neutral-600">
                      Total repair time: {ticket.resolution.timeSpentMinutes}{" "}
                      minutes
                    </p>
                  </div>
                )}
                <button
                  onClick={() => router.push("/engineer")}
                  className="px-6 py-3 bg-gradient-to-r from-zenith-accent-500 to-zenith-accent-600 text-white rounded-lg hover:from-zenith-accent-600 hover:to-zenith-accent-700 transition-all font-medium"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <TaskSummaryCard ticket={ticket} atm={atm} />
      </main>
    </div>
  );
};
export default TaskDetail;
