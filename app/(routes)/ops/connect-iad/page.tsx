// app/operations/connect-iad/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import IADStepProgress from "@/components/ops/iad/IADStepProgress";
import IADVerificationForm from "@/components/ops/iad/IADVerificationForm";
import IADConnectionPanel from "@/components/ops/iad/IADConnectionPanel";
import IADPersonnelManager from "@/components/ops/iad/IADPersonnelManager";
import IADDataFlowViz from "@/components/ops/iad/IADDataFlowViz";
import { useIADStore } from "@/lib/store/IADStore";
import { useTransparencyStore } from "@/lib/store/transparencyStore";
import Sidebar from "@/components/ops/Sidebar";
import { TopNav } from "@/components/ops/TopNav";
import { AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

export default function ConnectIADPage() {
  const { current, verificationStatus, connected, seedMock } = useIADStore();

  const { addLog } = useTransparencyStore();
  useEffect(() => {
    // quick dev helper - seed mock IAD
    if (!current) seedMock();
  }, []);

  const step = useMemo(() => {
    if (!current || verificationStatus === "NOT_STARTED") return 0;
    if (verificationStatus === "PENDING") return 0;
    if (verificationStatus === "REJECTED") return 0;
    if (verificationStatus === "VERIFIED" && !connected) return 1;
    if (connected) return 2;
    return 0;
  }, [current, verificationStatus, connected]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Connect Independent ATM Deployer (IAD)
          </h1>
          <p className="text-sm text-gray-500">
            Link third-party ATM operators to your operations system with
            auditable verification and secure sync.
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              // logTransparencyAction("CONNECT_IAD_PAGE_VIEWED");
              addLog({
                type: "user-action",
                details: `Connect IAD page export CBN registry clicked for IAD ${current?.name} (${current?.id})`,
                severity: "info",
                user: { id: "system", role: "ops" },
                meta: {
                  iadName: current?.name ?? "N/A",
                  iadId: current?.id ?? "N/A",
                },
              });
            }}
            className="text-xs bg-gray-100 px-3 py-2 rounded"
          >
            Export CBN Registry
          </button>
        </div>
      </div>

      <IADStepProgress step={step} />
      <AnimatePresence mode="wait">
        {step === 0 && <IADVerificationForm />}
        {step === 1 && <IADConnectionPanel />}
        {step === 2 && <IADDataFlowViz />}
        {step === 2 && <IADPersonnelManager />}
        {step === 2 && (
          <div
            style={{
              backgroundColor: "var(--color-zenith-neutral-50)",
              color: "var(--color-zenith-neutral-700)",
            }}
            className="p-4 rounded shadow"
          >
            <h4
              style={{ color: "var(--color-zenith-neutral-900)" }}
              className="font-semibold"
            >
              Audit & Transparency
            </h4>
            <div
              style={{ color: "var(--color-zenith-neutral-500)" }}
              className="text-xs mt-2 flex items-center gap-2 rounded-lg w-full px-2 py-3 bg-zenith-accent-50 border border-zenith-accent-100"
            >
              <Info size={20} /> All verification and sync actions with this IAD
              are logged in the Transparency Ledger for audit and compliance
              purposes.
            </div>
            <div className="mt-3">
              <button
                onClick={() =>
                  addLog({
                    type: "user-action",
                    details: `Connect IAD page download audit logs clicked for IAD ${current?.name} (${current?.id})`,
                    severity: "info",
                    user: { id: "system", role: "ops" },
                    meta: {
                      iadName: current?.name ?? "N/A",
                      iadId: current?.id ?? "N/A",
                    },
                  })
                }
                style={{
                  backgroundColor: "var(--color-zenith-accent-600)",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  width: "100%",
                }}
              >
                Download Audit Logs
              </button>
            </div>
            <div
              style={{ color: "var(--color-zenith-neutral-400)" }}
              className="mt-3 text-xs"
            >
              Tip: Use the &quot;Sync Now&quot; button in connection panel to
              run on-demand sync with the IAD network.
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
