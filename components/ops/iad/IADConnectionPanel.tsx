"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plug, Unplug, RefreshCcw, Activity, Wifi } from "lucide-react";
import { useIADStore } from "@/lib/store/IADStore";
import { connectIAD, disconnectIAD, syncIADData } from "@/lib/api/iadApi";
import { useTransparencyStore } from "@/lib/store/transparencyStore";
import { toast } from "sonner";

export default function IADConnectionPanel() {
  const {
    current,
    verificationStatus,
    connected,
    setConnected,
    addSyncLog,
    syncLogs,
  } = useIADStore();
  const [loading, setLoading] = useState(false);
  const [connId, setConnId] = useState<string | null>(null);
  const { addLog } = useTransparencyStore();

  if (!current) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg bg-gray-50 text-center shadow-md border border-gray-100"
      >
        <Activity className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          No IAD selected — please verify an IAD first.
        </p>
      </motion.div>
    );
  }

  const handleConnect = async () => {
    setLoading(true);
    addLog({
      type: "security-event",
      details: `IAD connection attempt for ${current.name}`,
      severity: "info",
    });

    const resp = await connectIAD(current);
    if (resp.ok) {
      setConnId(resp.connectionId!);
      setConnected(true);
      addSyncLog(`Connected: ${resp.connectionId}`);
      toast.success("IAD connected successfully");
    } else {
      toast.error("Failed to connect IAD");
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (!connId) return;
    setLoading(true);
    await disconnectIAD(connId);
    setConnected(false);
    addSyncLog(`Disconnected: ${connId}`);
    toast.info("IAD disconnected");
    setConnId(null);
    setLoading(false);
  };

  const handleSync = async () => {
    if (!connected) return;
    setLoading(true);
    addSyncLog("Sync started...");
    toast.loading("Syncing data...");
    const r = await syncIADData(current.id);
    addSyncLog(`${r.recordsSynced} records synced`);
    toast.success(`${r.recordsSynced} records synced successfully`);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-indigo-600" /> {current.name}
          </h2>
          <p className="text-sm text-gray-500">
            License: {current.licenseNumber}
          </p>
          <p className="text-sm text-gray-500">
            Partners: {current.switchPartners?.join(", ") || "None"}
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              verificationStatus === "VERIFIED"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {verificationStatus}
          </span>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="flex flex-wrap gap-3">
        {!connected ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-all disabled:opacity-50"
          >
            <Plug className="w-4 h-4" />
            {loading ? "Connecting..." : "Connect IAD"}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-all disabled:opacity-50"
          >
            <Unplug className="w-4 h-4" />
            {loading ? "Disconnecting..." : "Disconnect"}
          </button>
        )}

        <button
          onClick={handleSync}
          disabled={!connected || loading}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-all disabled:opacity-40"
        >
          <RefreshCcw className="w-4 h-4" />
          Sync Data
        </button>
      </div>

      {/* Connection Status */}
      <div className="text-sm text-gray-600">
        <strong>Connection ID:</strong> {connId || "—"}
      </div>

      {/* Sync Logs */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Sync Logs</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2 max-h-40 overflow-auto text-xs">
          <AnimatePresence>
            {syncLogs.length > 0 ? (
              syncLogs.map((log, i) => (
                <motion.div
                  key={log.id || i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-dashed border-gray-200 py-1 text-gray-600"
                >
                  {log.ts} — {log.message}
                </motion.div>
              ))
            ) : (
              <p className="text-gray-400 italic">No sync logs yet.</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
