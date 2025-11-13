"use client";

import Sidebar from "@/components/ops/Sidebar";
import { TopNav } from "@/components/ops/TopNav";
import Filters from "@/components/ops/Filters";
import KpiCard from "@/components/ops/KpiCard";
import ActivityChart from "@/components/ops/ActivityChart";
import TopicList from "@/components/ops/TopicList";
import Leaderboard from "@/components/ops/Leaderboard";
import { AtmNetworkUptime } from "@/components/ops/kpis/AtmNetworkUptime";

import { MeanTimeToRepair } from "@/components/ops/kpis/MeanTImeToRepair";
import { AtmDowntimeByRegion } from "@/components/ops/kpis/AtmDowntimeByRegion";
import { IncidentBreakdown } from "@/components/ops/kpis/IncidentBreakdown";
import { FraudDetectionRate } from "@/components/ops/kpis/FraudDetectionRate";
import { CashAvailability } from "@/components/ops/kpis/CashAvailability";
import { EngineerUtilization } from "@/components/ops/kpis/EngineerUtilization";
import { CashReplenishmentTime } from "@/components/ops/kpis/CashReplenishmentTime";
import { TopAtmsByVolume } from "@/components/ops/kpis/TopAtmsByVolume";
import { RecurringFaults } from "@/components/ops/kpis/RecurringFaults";
import { SLACompliance } from "@/components/ops/kpis/SLACompliance";
import { RegionalPerformance } from "@/components/ops/kpis/RegionalPerformance";
import { TotalCostOfOperations } from "@/components/ops/kpis/TotalCostOfOperations";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";
import { useTicketStore, selectTickets } from "@/lib/store/ticketStore";
import { useAlertStore, selectAlerts } from "@/lib/store/alertStore";
import { calculateNetworkUptime, calculateMTTR } from "@/lib/utils/atmMetrics";
import { useEffect } from "react";

export default function OpsPage() {
  const atms = useAtmStore(selectAtms);
  const tickets = useTicketStore(selectTickets);
  const alerts = useAlertStore(selectAlerts);
  const refreshAtms = useAtmStore((state) => state.refresh);
  const refreshTickets = useTicketStore((state) => state.refresh);
  const refreshAlerts = useAlertStore((state) => state.refresh);

  useEffect(() => {
    // Refresh data on mount
    refreshAtms();
    refreshTickets();
    refreshAlerts();
  }, [refreshAtms, refreshTickets, refreshAlerts]);

  const uptime =
    Array.isArray(atms) && atms.length ? calculateNetworkUptime(atms) : 0;
  const mttr =
    Array.isArray(tickets) && tickets.length ? calculateMTTR(tickets) : 0;

  const onlineAtms = atms?.filter((a) => a.status === "ONLINE").length; //toString
  const totalAtms = atms?.length;
  const activeTickets = tickets?.filter(
    (t) => t.status !== "RESOLVED" && t.status !== "CLOSED"
  ).length;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  };

  return (
    <>
      <Filters />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Top KPI Row */}
        <div
          data-guide="kpi-cards"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <KpiCard title="Active ATMs" value={`${onlineAtms}/${totalAtms}`} />
          <KpiCard title="Network Uptime" value={`${uptime}%`} />
          <KpiCard title="Mean Time to Repair" value={formatTime(mttr)} />
          <KpiCard title="Active Tickets" value={activeTickets?.toString()} />
        </div>

        {/* Main KPI Section - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div data-guide="network-uptime">
            <AtmNetworkUptime />
          </div>
          <SLACompliance />
          <MeanTimeToRepair />
        </div>

        {/* Main KPI Section - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IncidentBreakdown />
          <CashAvailability />
        </div>

        {/* Main KPI Section - Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AtmDowntimeByRegion />
          <RegionalPerformance />
        </div>

        {/* Main KPI Section - Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FraudDetectionRate />
          <EngineerUtilization />
        </div>

        {/* Main KPI Section - Row 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CashReplenishmentTime />
          <TotalCostOfOperations />
        </div>

        {/* Main KPI Section - Row 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopAtmsByVolume />
          <RecurringFaults />
        </div>

        {/* Activity Chart and Other Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div data-guide="activity-chart">
            <ActivityChart />
          </div>
          <div className="space-y-4">
            <TopicList />
            <Leaderboard />
          </div>
        </div>
      </div>
    </>
  );
}
