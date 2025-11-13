"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  ShieldCheck,
  Loader2,
  RotateCcw,
  MapPin,
  User,
  Link2,
  FileSearch,
} from "lucide-react";
import { verifyIAD } from "@/lib/api/iadApi";
import { useIADStore, type IADDetails } from "@/lib/store/IADStore";
import { useTransparencyStore } from "@/lib/store/transparencyStore";

export default function IADVerificationForm() {
  const { setCurrent, setVerificationStatus } = useIADStore();
  const { addLog } = useTransparencyStore();

  const [form, setForm] = useState<IADDetails>({
    id: "",
    name: "",
    licenseNumber: "",
    ninssRegistered: false,
    switchPartners: [],
    address: "",
    contactPerson: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.licenseNumber) {
      toast.error("IAD Name and License Number are required");
      return;
    }

    setLoading(true);
    setVerificationStatus("PENDING");

    addLog({
      type: "security-event",
      details: `IAD verification started for ${form.name} (${form.licenseNumber})`,
      severity: "info",
      user: { id: "system", role: "ops" },
    });

    const resp = await verifyIAD(form);

    if (resp.ok) {
      setCurrent({ ...form, id: form.id || `IAD-${Date.now()}` });
      setVerificationStatus("VERIFIED");
      setResult("Verified successfully");
      toast.success(`${form.name} verified successfully`);
      addLog({
        type: "security-event",
        severity: "info",
        details: `IAD verified successfully: ${form.name}`,
      });
    } else {
      setVerificationStatus("REJECTED");
      setResult(`Verification failed: ${resp.reason}`);
      toast.error(`Verification failed: ${resp.reason}`);
      addLog({
        type: "security-event",
        severity: "warning",
        details: `IAD verification failed for ${form.name}: ${resp.reason}`,
      });
    }

    setLoading(false);
  }

  function handleReset() {
    setForm({
      id: "",
      name: "",
      licenseNumber: "",
      ninssRegistered: false,
      switchPartners: [],
      address: "",
      contactPerson: "",
    });
    setResult(null);
    setVerificationStatus("NOT_STARTED");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-white shadow-lg rounded-lg mt-8 border"
    >
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-indigo-600 w-6 h-6" />
        <h2 className="text-xl md:text-2xl font-semibold text-slate-800">
          Independent ATM Deployer Verification
        </h2>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {/* IAD Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Building2 className="w-4 h-4" /> IAD Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. CashConnect Nigeria Limited"
            className="border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* License Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
            <FileSearch className="w-4 h-4" /> License Number
          </label>
          <input
            type="text"
            value={form.licenseNumber}
            onChange={(e) =>
              setForm({ ...form, licenseNumber: e.target.value })
            }
            placeholder="e.g. CBN/IAD/2025/0123"
            className="border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Registered Address
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
            placeholder="e.g. 12 Kofo Abayomi Street, Victoria Island, Lagos"
            className="border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Contact Person */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
            <User className="w-4 h-4" /> Contact Person
          </label>
          <input
            type="text"
            value={form.contactPerson}
            onChange={(e) =>
              setForm({ ...form, contactPerson: e.target.value })
            }
            placeholder="e.g. Samuel Adewale"
            className="border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Switch Partners */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Link2 className="w-4 h-4" /> Switch Partners
          </label>
          <input
            type="text"
            value={form.switchPartners?.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                switchPartners: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="e.g. Interswitch, eTranzact, NIBSS"
            className="border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Verify IAD
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 border border-slate-300 px-5 py-2.5 rounded-md text-slate-700 hover:bg-slate-100 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-sm font-medium ${
              result.includes("failed") ? "text-red-600" : "text-green-600"
            }`}
          >
            {result}
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
