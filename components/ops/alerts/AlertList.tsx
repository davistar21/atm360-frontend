"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkle,
  X,
} from "lucide-react";
import {
  useAlertStore,
  selectAlerts,
  selectLoading,
} from "@/lib/store/alertStore";
import AIActionPanel from "./AIActionPanel";
import formatText from "@/lib/utils/formatText";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttentionButton from "@/components/BouncyButton";

const PAGE_SIZE = 10;

export function AlertList() {
  const alerts = useAlertStore(selectAlerts);
  const loading = useAlertStore(selectLoading);
  const acknowledgeAlert = useAlertStore((s) => s.acknowledgeAlert);
  const refresh = useAlertStore((s) => s.refresh);
  const [selectedAlert, setSelectedAlert] = useState<
    | { alert: Alert; mode?: "single" }
    | { alerts: Alert[]; mode: "batch" }
    | null
  >(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState<"active" | "resolved" | "all">("active");
  const filteredAlerts = useMemo(() => {
    if (tab === "active") return alerts.filter((a) => !a.acknowledged);
    if (tab === "resolved") return alerts.filter((a) => a.acknowledged);
    return alerts;
  }, [alerts, tab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
    } catch (error) {
      toast.error("Failed to acknowledge alert!");
    }
  };

  const getSeverityStyles = (severity: Alert["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return {
          badge:
            "bg-[var(--color-zenith-red-50)] text-[var(--color-zenith-red-700)]",
          icon: "text-zenith-red-500",
        };
      case "HIGH":
        return {
          badge:
            "bg-[var(--color-zenith-warning)]/10 text-[var(--color-zenith-warning)]",
          icon: "text-[var(--color-zenith-warning)]",
        };
      case "MEDIUM":
        return {
          badge: "bg-[var(--color-zenith-accent-50)] text-zenith-accent-700",
          icon: "text-[var(--color-zenith-accent-500)]",
        };
      default:
        return {
          badge: "bg-zenith-neutral-100 text-zenith-neutral-900",
          icon: "text-zenith-neutral-500",
        };
    }
  };

  const totalPages = Math.ceil(filteredAlerts.length / PAGE_SIZE);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="relative h-full overflow-y-auto bg-zenith-neutral-50 border border-zenith-neutral-200 rounded-xl shadow-sm flex flex-col">
      {/* Header */}
      {/* Header with Tabs */}
      <div className="sticky top-0 z-10 p-4 bg-zenith-neutral-100 border-b border-zenith-neutral-200 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-zenith-neutral-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-zenith-red-500" />
          {tab === "active"
            ? "Active Alerts"
            : tab === "resolved"
            ? "Resolved Alerts"
            : "All Alerts"}
        </h3>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "active" | "resolved" | "all")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full bg-zenith-neutral-200 rounded-lg">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-white data-[state=active]:text-zenith-accent-700"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="resolved"
              className="data-[state=active]:bg-white data-[state=active]:text-zenith-accent-700"
            >
              Resolved
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white data-[state=active]:text-zenith-accent-700"
            >
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === "active" && filteredAlerts.length !== 0 && (
        <AttentionButton
          onClick={() =>
            setSelectedAlert({ mode: "batch", alerts: filteredAlerts })
          }
          className="ml-auto mr-2 bg-zenith-accent-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-zenith-accent-700 transition my-4"
          title="Let Zeni handle all alerts"
        >
          <Sparkle />
        </AttentionButton>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zenith-neutral-200">
          <thead className="bg-zenith-neutral-100 ">
            <tr>
              <th scope="col" className="w-[65px]"></th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-zenith-neutral-600 uppercase tracking-wider"
              >
                Severity
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-zenith-neutral-600 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-zenith-neutral-600 uppercase tracking-wider"
              >
                ATM ID
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-zenith-neutral-600 uppercase tracking-wider"
              >
                Message
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-zenith-neutral-600 uppercase tracking-wider"
              >
                Timestamp
              </th>

              {/* Add a new column for Prediction Information */}
              <th
                scope="col"
                className="relative px-4 py-3 text-xs font-semibold text-zenith-neutral-600 uppercase tracking-wider text-center"
              >
                Prediction
              </th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-4 py-3">
                    <div className="space-x-2">
                      <div className="h-4 bg-zenith-neutral-200 rounded w-1/3" />
                      <div className="h-4 bg-zenith-neutral-200 rounded w-2/3" />
                      <div className="h-4 bg-zenith-neutral-200 rounded w-1/2" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody className="divide-y divide-zenith-neutral-200 bg-white">
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-zenith-neutral-500"
                  >
                    <div>
                      <span>All active alerts have been resolved. </span>
                      <span className="text-sm">No alerts at this time.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert) => {
                  const style = getSeverityStyles(alert.severity);
                  return (
                    <tr
                      key={alert.id}
                      onClick={() => {
                        if (tab !== "active") return;
                        setSelectedAlert({ alert, mode: "single" });
                      }}
                      className={`cursor-pointer hover:bg-zenith-neutral-100 transition ${
                        alert.acknowledged ? "opacity-60" : ""
                      }`}
                      tabIndex={0}
                      role="button"
                      aria-pressed="false"
                    >
                      <td>
                        {alert.acknowledged ? (
                          <Check className="w-5 h-5 text-zenith-accent-500 mx-auto" />
                        ) : (
                          <AlertTriangle
                            className={`w-5 h-5 mx-auto ${style.icon}`}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}
                        >
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-zenith-neutral-900 whitespace-nowrap">
                        {formatText(alert.type)}
                      </td>
                      <td className="px-4 py-3 align-top font-semibold text-zenith-neutral-900 whitespace-nowrap">
                        {alert.atmId}
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-zenith-neutral-900 line-clamp-2 max-w-xs">
                        {alert.message}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-zenith-neutral-500 whitespace-nowrap">
                        {new Date(alert.timestamp).toLocaleString()}
                      </td>

                      {/* Displaying Prediction Info */}
                      <td className="px-4 py-3 align-top text-xs text-zenith-neutral-500 w-[280px] max-w-[280px] overflow-x-auto whitespace-nowrap scrollbar">
                        {alert.prediction ? (
                          <>
                            <div>
                              <strong>Reasoning:</strong>{" "}
                              {alert.prediction.reasoning}
                            </div>
                            <div>
                              <strong>Confidence:</strong>{" "}
                              {alert.prediction.confidence * 100}%
                            </div>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {alerts.length > PAGE_SIZE && (
        <div className="flex justify-between items-center p-4 bg-zenith-neutral-100 border-t border-zenith-neutral-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-zenith-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zenith-neutral-300 transition"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm text-zenith-neutral-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-zenith-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zenith-neutral-300 transition"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Zeni Copilot AI Panel */}
      <AnimatePresence>
        {tab === "active" && selectedAlert && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-[440px] bg-white shadow-2xl border-l border-zenith-neutral-200 z-20"
          >
            <div className="flex justify-between items-center p-4">
              <div className="text-lg font-semibold mb-4 text-zenith-neutral-900 flex items-center gap-2">
                <span>Zeni Copilot</span>
                <img src="/images/zeni.png" className="w-4 h-4 animate-spin" />
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 text-zenith-neutral-500 hover:text-zenith-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Separator />
            <div className="p-4">
              <AIActionPanel
                alert={
                  selectedAlert.mode === "single"
                    ? selectedAlert.alert
                    : undefined
                }
                alerts={
                  selectedAlert.mode === "batch" ? selectedAlert.alerts : []
                }
                mode={selectedAlert.mode || "single"}
                onClose={() => setSelectedAlert(null)}
                handleAcknowledge={handleAcknowledge}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
