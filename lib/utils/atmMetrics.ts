/**
 * Utility functions to compute KPI metrics from Zustand store data
 */

// ATM Network Uptime - Percentage of ATMs currently online
export function calculateNetworkUptime(atms: ATM[]): number {
  if (atms?.length === 0) return 0;
  const onlineCount = atms?.filter((atm) => atm.status === "ONLINE")?.length;
  return Math.round((onlineCount / atms?.length) * 100);
}

// Mean Time to Repair - Average time from issue detection to resolution
export function calculateMTTR(tickets: Ticket[]): number {
  if (!Array.isArray(tickets) || tickets?.length === 0) return 0;

  const resolvedTickets = tickets?.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  );

  const validTickets = resolvedTickets?.filter(
    (t) =>
      t.createdAt &&
      t.resolution?.resolvedAt &&
      !isNaN(Date.parse(t.createdAt)) &&
      !isNaN(Date.parse(t.resolution.resolvedAt))
  );

  if (validTickets?.length === 0) return 0;

  const totalTime = validTickets.reduce((acc, t) => {
    const created = new Date(t.createdAt);
    const resolved = new Date(t.resolution?.resolvedAt ?? "");
    if (isNaN(created.getTime()) || isNaN(resolved.getTime())) return acc;

    return acc + Math.max(0, resolved.getTime() - created.getTime());
  }, 0);

  const avgTimeMs = totalTime / validTickets?.length;
  return Math.round(avgTimeMs / (1000 * 60)); // in minutes
}

// ATM Downtime by Region - Group downtime by state
export function calculateDowntimeByRegion(atms: ATM[]): Array<{
  region: string;
  downtime: number;
  totalAtms: number;
  offlineAtms: number;
}> {
  const regionMap = new Map<string, { total: number; offline: number }>();

  atms?.forEach((atm) => {
    const state = atm.location.state || "Unknown";
    const current = regionMap.get(state) || { total: 0, offline: 0 };
    current.total++;
    if (atm.status !== "ONLINE") {
      current.offline++;
    }
    regionMap.set(state, current);
  });

  return Array.from(regionMap.entries())
    .map(([region, data]) => ({
      region,
      downtime: data.total > 0 ? (data.offline / data.total) * 100 : 0,
      totalAtms: data.total,
      offlineAtms: data.offline,
    }))
    .sort((a, b) => b.downtime - a.downtime);
}

// Incident Breakdown by Type
export function calculateIncidentBreakdown(
  tickets: Ticket[],
  alerts: Alert[]
): Array<{ type: string; count: number; color: string }> {
  const ticketTypes = new Map<string, number>();

  // Count ticket types
  tickets?.forEach((ticket) => {
    const type = ticket.issueType;
    ticketTypes.set(type, (ticketTypes.get(type) || 0) + 1);
  });

  // Count alert types
  alerts?.forEach((alert) => {
    const type = alert.type;
    ticketTypes.set(type, (ticketTypes.get(type) || 0) + 1);
  });

  const colors = [
    "#ef4444", // red
    "#f59e0b", // amber
    "#3b82f6", // blue
    "#10b981", // green
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
  ];

  return Array.from(ticketTypes.entries())
    .map(([type, count], index) => ({
      type: type.replace(/_/g, " "),
      count,
      color: colors[index % colors?.length],
    }))
    .sort((a, b) => b.count - a.count);
}

// Cash Availability - Percentage of ATMs with sufficient cash
export function calculateCashAvailability(atms: ATM[]): {
  full: number;
  low: number;
  empty: number;
  percentage: number;
} {
  let full = 0;
  let low = 0;
  let empty = 0;

  atms?.forEach((atm) => {
    const { currentAmount, lowThreshold, emptyThreshold } = atm.cashLevel;

    if (currentAmount <= emptyThreshold) {
      empty++;
    } else if (currentAmount <= lowThreshold) {
      low++;
    } else {
      full++;
    }
  });

  const total = atms?.length;
  const available = full + low; // ATMs with cash (even if low)

  return {
    full,
    low,
    empty,
    percentage: total > 0 ? Math.round((available / total) * 100) : 0,
  };
}

// Engineer Utilization Rate
export function calculateEngineerUtilization(tickets: Ticket[]): Array<{
  engineerId: string;
  totalTasks: number;
  resolved: number;
  inProgress: number;
}> {
  const engineerMap = new Map<
    string,
    { total: number; resolved: number; inProgress: number }
  >();

  tickets?.forEach((ticket) => {
    if (ticket.engineerId) {
      const current = engineerMap.get(ticket.engineerId) || {
        total: 0,
        resolved: 0,
        inProgress: 0,
      };
      current.total++;
      if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
        current.resolved++;
      } else if (
        ticket.status === "IN_PROGRESS" ||
        ticket.status === "ASSIGNED"
      ) {
        current.inProgress++;
      }
      engineerMap.set(ticket.engineerId, current);
    }
  });

  return Array.from(engineerMap.entries())
    .map(([engineerId, data]) => ({
      engineerId,
      totalTasks: data.total,
      resolved: data.resolved,
      inProgress: data.inProgress,
    }))
    .sort((a, b) => b.totalTasks - a.totalTasks);
}

// Average Time to Cash Replenishment (simulated based on cash level changes)
export function calculateCashReplenishmentTime(atms: ATM[]): number {
  // This is a simplified calculation
  // In a real system, you'd track when cash was replenished
  // For now, we'll estimate based on ATMs that went from empty/low to full
  // Since we don't have historical data, we'll return a mock trend
  return 120; // minutes (mock value - would need historical data)
}

// Top 10 ATMs by Transaction Volume
// Note: Transaction volume isn't in the ATM type, so we'll use a proxy metric
export function calculateTopAtmsByVolume(atms: ATM[]): Array<{
  atmId: string;
  location: string;
  volume: number; // Proxy: using uptime or cash level as indicator
}> {
  return atms
    .map((atm) => ({
      atmId: atm.id,
      location: atm.location.address || atm.location.branchName || "Unknown",
      volume: atm.uptimeMetrics?.uptimePercentageLast7Days || 50, // Proxy metric
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);
}

// Recurring Faults - ATMs that frequently require repairs
export function calculateRecurringFaults(
  atms: ATM[],
  tickets: Ticket[]
): Array<{ atmId: string; location: string; faultCount: number }> {
  const faultMap = new Map<string, number>();

  tickets?.forEach((ticket) => {
    const count = faultMap.get(ticket.atmId) || 0;
    faultMap.set(ticket.atmId, count + 1);
  });

  return Array.from(faultMap.entries())
    .map(([atmId, faultCount]) => {
      const atm = atms.find((a) => a.id === atmId);
      return {
        atmId,
        location:
          atm?.location.address || atm?.location.branchName || "Unknown",
        faultCount,
      };
    })
    .sort((a, b) => b.faultCount - a.faultCount)
    .slice(0, 10);
}

// SLA Compliance - Percentage of incidents resolved within SLA
export function calculateSLACompliance(tickets: Ticket[]): {
  compliant: number;
  breached: number;
  percentage: number;
} {
  // Assuming SLA is 4 hours (240 minutes) for critical, 8 hours for high, etc.
  const getSLAThreshold = (severity: Ticket["severity"]): number => {
    switch (severity) {
      case "CRITICAL":
        return 240; // 4 hours
      case "HIGH":
        return 480; // 8 hours
      case "MEDIUM":
        return 1440; // 24 hours
      case "LOW":
        return 2880; // 48 hours
      default:
        return 1440;
    }
  };

  let compliant = 0;
  let breached = 0;

  const resolvedTickets = tickets?.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  );

  resolvedTickets?.forEach((ticket) => {
    if (ticket.resolution?.resolvedAt && ticket.createdAt) {
      const created = new Date(ticket.createdAt).getTime();
      const resolved = new Date(ticket.resolution.resolvedAt).getTime();
      const timeTaken = (resolved - created) / (1000 * 60); // minutes
      const threshold = getSLAThreshold(ticket.severity);

      if (timeTaken <= threshold) {
        compliant++;
      } else {
        breached++;
      }
    }
  });

  const total = compliant + breached;
  return {
    compliant,
    breached,
    percentage: total > 0 ? Math.round((compliant / total) * 100) : 0,
  };
}

// Regional Performance Comparison
export function calculateRegionalPerformance(atms: ATM[]): Array<{
  region: string;
  uptime: number;
  incidentCount: number;
  cashAvailability: number;
}> {
  const regionMap = new Map<
    string,
    {
      atms: ATM[];
      online: number;
      totalCash: number;
      availableCash: number;
    }
  >();

  atms?.forEach((atm) => {
    const state = atm.location.state || "Unknown";
    const current = regionMap.get(state) || {
      atms: [],
      online: 0,
      totalCash: 0,
      availableCash: 0,
    };
    current.atms.push(atm);
    if (atm.status === "ONLINE") {
      current.online++;
    }
    current.totalCash += atm.cashLevel.totalCapacity;
    current.availableCash += atm.cashLevel.currentAmount;
    regionMap.set(state, current);
  });

  return Array.from(regionMap.entries()).map(([region, data]) => {
    const uptime =
      data.atms?.length > 0 ? (data.online / data.atms?.length) * 100 : 0;
    const cashAvailability =
      data.totalCash > 0 ? (data.availableCash / data.totalCash) * 100 : 0;

    return {
      region,
      uptime: Math.round(uptime),
      incidentCount: 0, // Would need tickets/alerts filtered by region
      cashAvailability: Math.round(cashAvailability),
    };
  });
}

// Total Cost of ATM Operations (mock - would need actual cost data)
export function calculateTotalCost(
  atms: ATM[],
  tickets: Ticket[]
): Array<{ month: string; cost: number }> {
  // Mock data - in reality, this would come from a cost tracking system
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Estimate cost based on number of ATMs and tickets
  const baseCostPerAtm = 50000; // Naira per month
  const costPerTicket = 15000; // Average cost per ticket

  return months.map((month, index) => {
    const atmCost = atms?.length * baseCostPerAtm;
    const maintenanceCost = tickets?.length * costPerTicket * (index + 1) * 0.1; // Decreasing trend
    return {
      month,
      cost: Math.round(atmCost + maintenanceCost),
    };
  });
}

// Fraud Detection Rate (mock - would need fraud data)
export function calculateFraudDetectionRate(): Array<{
  date: string;
  detected: number;
  prevented: number;
}> {
  // Mock data - in reality, this would come from a fraud detection system
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  // Deterministic mock data based on date index
  return dates.map((date, index) => {
    const dayOfWeek = index % 7;
    const baseDetected = 10 + dayOfWeek; // Vary by day of week
    const basePrevented = 8 + dayOfWeek - 1;
    const variation = (index % 5) - 2; // Small variation

    return {
      date,
      detected: Math.max(5, baseDetected + variation),
      prevented: Math.max(3, basePrevented + variation),
    };
  });
}
