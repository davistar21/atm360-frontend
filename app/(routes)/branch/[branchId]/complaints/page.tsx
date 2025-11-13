"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import BranchSidebar from "@/components/branch/BranchSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BranchComplaintsPage() {
  const params = useParams();
  const branchId = params?.branchId as string;
  const router = useRouter();

  const [complaintText, setComplaintText] = useState("");
  const [complaintType, setComplaintType] = useState<
    "POOR_QUALITY" | "DELAY" | "OTHER"
  >("POOR_QUALITY");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComplaint = async () => {
    if (!complaintText.trim()) {
      toast.error("Please enter complaint details");
      return;
    }

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Complaint submitted to operations team");
      setComplaintText("");
      setComplaintType("POOR_QUALITY");
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <BranchSidebar branchId={branchId} />
      <div className="flex-1 flex flex-col space-y-6 h-screen overflow-y-auto scrollbar">
        <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zenith-neutral-900">
              Submit Complaint to Operations
            </h1>
            <p className="text-sm text-zenith-neutral-600">
              Report issues or provide feedback to the operations team
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-zenith-red-600" />
              <h2 className="text-xl font-semibold text-zenith-neutral-900">
                New Complaint
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
                  placeholder="Describe the issue or provide feedback to the operations team..."
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={handleSubmitComplaint}
                disabled={submitting || !complaintText.trim()}
                className="w-full bg-gradient-to-r from-zenith-red-500 to-zenith-red-600 hover:from-zenith-red-600 hover:to-zenith-red-700 disabled:opacity-50"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit to Operations Team
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

