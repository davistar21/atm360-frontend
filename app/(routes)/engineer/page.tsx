"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { LogoutIcon, AtmIcon, AlertIcon } from "@/components/icons";
import { Clock, MapPin, CheckCircle, Circle } from "lucide-react";
import { motion } from "framer-motion";

import useAtmStore, { selectAtms, selectGetById } from "@/lib/store/atmStore";
import { useAlertStore, selectAlerts } from "@/lib/store/alertStore";
import useTicketStore, { selectTickets } from "@/lib/store/ticketStore";

export default function EngineerPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const atms = useAtmStore(selectAtms) ?? [];

  useEffect(() => {
    // Ensure stores are refreshed on dashboard load and periodically
    (async () => {
      await Promise.all([
        useAtmStore.getState().refresh(),
        useAlertStore.getState().refresh(),
        useTicketStore.getState().refresh(),
      ]);
    })();
    const interval = setInterval(() => useAtmStore.getState().refresh(), 30000);
    const alertsInterval = setInterval(
      () => useAlertStore.getState().refresh(),
      30000
    );
    const ticketsInterval = setInterval(
      () => useTicketStore.getState().refresh(),
      30000
    );
    return () => {
      clearInterval(interval);
      clearInterval(alertsInterval);
      clearInterval(ticketsInterval);
    };
  }, []);

  const alertsAll = useAlertStore(selectAlerts);
  const alerts = useMemo(
    () => (alertsAll ?? []).filter((a) => !a.acknowledged),
    [alertsAll]
  );
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const faultyAtms = (atms || []).filter((atm) => atm.status !== "ONLINE");

  // Get assigned tasks for this engineer
  const allTickets = useTicketStore(selectTickets);
  const assignedTickets = useMemo(
    () => {
      if (!user?.id) return [];
      return allTickets.filter((t) => t.engineerId === user.id);
    },
    [allTickets, user?.id]
  );
  
  // Filter active tasks (not resolved/closed)
  const activeTasks = useMemo(
    () =>
      assignedTickets.filter(
        (t) => t.status !== "RESOLVED" && t.status !== "CLOSED"
      ),
    [assignedTickets]
  );

  const handleCreate = async (atm: ATM) => {
    // Define ticket data options
    const issueTypes = [
      "CASH_LOW",
      "NETWORK_ISSUE",
      "HARDWARE_ERROR",
      "SECURITY_ALERT",
      "MAINTENANCE_DUE",
      "POWER_ISSUE",
      "CARD_JAM",
      "SCREEN_FAILURE",
      "OTHER",
    ] as const;
    const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
    const reporters = ["SYSTEM", "CUSTOMER", "BRANCH_MANAGER"] as const;

    // Use current timestamp as seed for pseudo-random selection
    const getRandomItem = <T,>(array: readonly T[]): T => {
      const index = Date.now() % array.length;
      return array[index];
    };

    // Select values deterministically based on ATM state
    const issueType = atm.telemetry?.errorCodes?.length
      ? issueTypes.find((type) =>
          atm.telemetry!.errorCodes?.some((code) => code.includes(type))
        ) ?? getRandomItem(issueTypes)
      : getRandomItem(issueTypes);

    const severity = atm.predictiveScore?.failureRisk
      ? atm.predictiveScore.failureRisk > 0.7
        ? "CRITICAL"
        : atm.predictiveScore.failureRisk > 0.4
        ? "HIGH"
        : atm.predictiveScore.failureRisk > 0.2
        ? "MEDIUM"
        : "LOW"
      : getRandomItem(severities);

    const reportedBy = getRandomItem(reporters);

    // Generate description based on issue type and ATM state
    const description = `${reportedBy} reported ${issueType
      .toLowerCase()
      .replace("_", " ")} malfunction at ${atm.location.branchName}. ${
      atm.telemetry?.errorCodes?.length
        ? `Error codes: ${atm.telemetry.errorCodes.join(", ")}. `
        : ""
    }${
      atm.predictiveScore?.failureRisk
        ? `Failure risk: ${(atm.predictiveScore.failureRisk * 100).toFixed(
            0
          )}%. `
        : ""
    }Requires immediate attention.`;

    // Create the ticket
    const ticket = await useTicketStore.getState().createTicket({
      atmId: atm.id,
      engineerId: user?.id || "",
      reportedBy,
      issueType,
      severity,
      description,
      status: "OPEN",
    });

    // Navigate to the new ticket
    router.push(`/engineer/task/${ticket.id}`);
  };
  const getTaskStep = (ticket: Ticket) => {
    if (!ticket.geoValidation?.validatedAt) return "Arrival";
    if (!ticket.resolution) return "Repair";
    if (ticket.resolution.proofPhotoUrl && ticket.status !== "RESOLVED")
      return "Proof Upload";
    if (ticket.status === "RESOLVED") return "Completion";
    return "Verification";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zenith-neutral-50 to-zenith-accent-50">
      <div className="bg-white border-b border-zenith-neutral-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zenith-neutral-900">
              Engineer Dashboard
            </h1>
            <p className="text-sm text-zenith-neutral-600">
              Service requests and ATM maintenance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zenith-neutral-900">
                {user?.name}
              </p>
              <p className="text-xs text-zenith-neutral-500">Engineer</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-zenith-neutral-600 hover:bg-zenith-neutral-100 rounded-lg transition-colors"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-zenith-neutral-900 mb-2">
              Welcome back, {user?.name || "Engineer"}! 👋
            </h2>
            <p className="text-zenith-neutral-600">
              You have {activeTasks.length} active task{activeTasks.length !== 1 ? "s" : ""} assigned to you.
            </p>
          </div>

          {/* Personal Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zenith-accent-100 rounded-lg">
                  <Clock className="w-5 h-5 text-zenith-accent-600" />
                </div>
                <div>
                  <p className="text-xs text-zenith-neutral-500">Engineer ID</p>
                  <p className="text-sm font-semibold text-zenith-neutral-900">
                    {user?.id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zenith-accent-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-zenith-accent-600" />
                </div>
                <div>
                  <p className="text-xs text-zenith-neutral-500">
                    Completed Tasks
                  </p>
                  <p className="text-sm font-semibold text-zenith-neutral-900">
                    {
                      assignedTickets.filter((t) => t.status === "RESOLVED")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zenith-accent-100 rounded-lg">
                  <Circle className="w-5 h-5 text-zenith-accent-600" />
                </div>
                <div>
                  <p className="text-xs text-zenith-neutral-500">
                    Active Tasks
                  </p>
                  <p className="text-sm font-semibold text-zenith-neutral-900">
                    {activeTasks.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-lg border border-zenith-neutral-200 mb-6">
          <div className="p-6 border-b border-zenith-neutral-200">
            <h2 className="text-xl font-semibold text-zenith-neutral-900">
              Your Tasks
            </h2>
            <p className="text-sm text-zenith-neutral-600 mt-1">
              Assigned tasks start directly at the Arrival step
            </p>
          </div>
          <div className="divide-y divide-zenith-neutral-200">
            {activeTasks.length === 0 ? (
              <div className="p-6 text-center text-zenith-neutral-500">
                <p className="mb-2">No active tasks assigned</p>
                <p className="text-sm">
                  New tasks will appear here when assigned to you.
                </p>
              </div>
            ) : (
              activeTasks.map((ticket) => {
                const atm = atms.find((a) => a.id === ticket.atmId);
                const step = getTaskStep(ticket);
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 hover:bg-zenith-neutral-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/engineer/task/${ticket.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-zenith-neutral-900">
                            Task #{ticket.id}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              ticket.severity === "CRITICAL"
                                ? "bg-red-100 text-red-700"
                                : ticket.severity === "HIGH"
                                ? "bg-orange-100 text-orange-700"
                                : ticket.severity === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {ticket.severity}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-zenith-accent-100 text-zenith-accent-700">
                            {step}
                          </span>
                        </div>
                        <p className="text-sm text-zenith-neutral-600 mb-2">
                          {ticket.issueType.replace("_", " ")}
                        </p>
                        {atm && (
                          <div className="flex items-center gap-2 text-sm text-zenith-neutral-500">
                            <MapPin className="w-4 h-4" />
                            <span>{atm.location.branchName || atm.location.address}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/engineer/task/${ticket.id}`);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-zenith-accent-500 to-zenith-accent-600 text-white rounded-lg hover:from-zenith-accent-600 hover:to-zenith-accent-700 transition-all text-sm font-medium"
                      >
                        View Task
                      </button>
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
