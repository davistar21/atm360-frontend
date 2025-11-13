// types/index.ts
/**
 * Shared types for Tickets and ATMs
 */
declare global {
  type Alert = {
    id: string;
    atmId: string;
    // atmName: string;
    type:
      | "CASH_LOW"
      | "NETWORK_ISSUE"
      | "HARDWARE_ERROR"
      | "SECURITY_ALERT"
      | "MAINTENANCE_DUE"
      | "POWER_ISSUE"
      | "CARD_JAM"
      | "SCREEN_FAILURE"
      | "OTHER";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    message: string;
    timestamp: string;
    acknowledged: boolean;
    prediction?: {
      reasoning: string;
      confidence: number; // 0 to 1
    };
  };

  type TicketResolution = {
    summary: string;
    resolvedAt: string;
    partsUsed?: string[];
    timeSpentMinutes: number;
    proofPhotoUrl?: string;
  };

  type GeoValidation = {
    engineerLat: number;
    engineerLng: number;
    validatedAt: string;
  };

  type Ticket = {
    id: string;
    atmId: string;
    engineerId?: string;
    reportedBy: "SYSTEM" | "CUSTOMER" | "BRANCH_MANAGER";
    issueType:
      | "CASH_LOW"
      | "NETWORK_ISSUE"
      | "HARDWARE_ERROR"
      | "SECURITY_ALERT"
      | "MAINTENANCE_DUE"
      | "POWER_ISSUE"
      | "CARD_JAM"
      | "SCREEN_FAILURE"
      | "OTHER";
    /*"CARD_READER",
      "CASH_DISPENSER",
      "RECEIPT_PRINTER",
      "SCREEN_FAILURE",
      "KEYPAD",
      "NETWORK",
      "SOFTWARE",*/
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description?: string;
    status:
      | "OPEN"
      | "ASSIGNED"
      | "IN_PROGRESS"
      | "RESOLVED"
      | "ESCALATED"
      | "CLOSED";
    createdAt: string;
    updatedAt: string;
    resolution?: {
      summary: string;
      resolvedAt: string;
      partsUsed?: string[];
      timeSpentMinutes: number;
      proofPhotoUrl?: string;
    };
    geoValidation?: {
      engineerLat?: number;
      engineerLng?: number;
      validatedAt?: string;
    };
    sourceData?: {
      telemetrySnapshot?: ATM; // A snapshot of the ATM state when ticket was created
      customerReportId?: string;
    };
  };

  type ATM = {
    id: string; // UUID or unique code e.g., "ATM-LAG-0012"
    bankId: string; // reference to Bank entity
    location: {
      branchName?: string;
      address: string;
      lga?: string;
      state?: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    model: string; // e.g., NCR SelfServ 80, Diebold Opteva 520
    type:
      | "CASH_DISPENSER"
      | "FULL_FUNCTION"
      | "DEPOSIT_ONLY"
      | "WITHDRAWAL_ONLY";
    status: "ONLINE" | "OFFLINE" | "OUT_OF_CASH" | "MAINTENANCE" | "UNKNOWN";
    lastUpdated: string; // ISO timestamp
    networkStatus: "CONNECTED" | "DISCONNECTED" | "INTERMITTENT";
    cashLevel: {
      totalCapacity: number; // in Naira
      currentAmount: number; // in Naira
      lowThreshold: number; // alert threshold
      emptyThreshold: number; // alert threshold
    };
    powerStatus: {
      mains: boolean;
      generator: boolean;
      inverter: boolean;
      fuelLevel?: number; // percentage
    };
    telemetry: {
      temperatureC?: number;
      errorCodes?: string[]; // e.g., ["E301", "D404"]
      lastErrorTimestamp?: string;
      workingHoursLastMonth?: number;
    };
    predictiveScore?: {
      failureRisk: number; // 0–1 score
      cashOutRisk: number; // 0–1 score
      networkFailureRisk: number; // 0–1 score
    };
    assignedEngineerId?: string;
    uptimeMetrics?: {
      uptimePercentageLast7Days: number;
      downtimeMinutesThisMonth: number;
    };
    createdAt: string;
    updatedAt: string;
  };
  // Common API response wrapper
  type ApiResponse<T> = {
    data: T;
    success: boolean;
    message?: string;
  };

  // API Error response
  type ApiError = {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}
export {};
