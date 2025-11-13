// /store/useTransparencyStore.ts
import { create } from "zustand";
import { nanoid } from "nanoid";
import { createJSONStorage, persist } from "zustand/middleware";

export interface TransparencyStats {
  total: number;
  bySeverity: Record<Severity, number>;
  byType: Record<LogType, number>;
  recentCritical: TransparencyLog[];
}
export type LogType =
  | "user-action"
  | "system-event"
  | "network-request"
  | "ui-change"
  | "alert"
  | "security-event"
  | "error";

export type Severity = "info" | "warning" | "error" | "critical";

// Define the structure of each log entry
export interface TransparencyLog {
  id: string;
  timestamp: string;
  type: LogType;
  details: string;
  severity?: Severity;
  user?: {
    id?: string;
    role?: "admin" | "ops" | "engineer" | "user" | "system";
    sessionId?: string;
  };
  meta?: Record<
    string,
    string | number | string[] | number[] | boolean | boolean[]
  >; // Optional dynamic data (e.g., request payloads)
}

// Zustand store definition
interface TransparencyState {
  logs: TransparencyLog[];
  addLog: (log: Omit<TransparencyLog, "id" | "timestamp">) => void;
  getLogs: () => TransparencyLog[];
}

export const useTransparencyStore = create<TransparencyState>()(
  persist(
    (set, get) => ({
      logs: [],

      // Adds a new immutable log entry
      addLog: (logData) =>
        set((state) => {
          const newLog = {
            ...logData,
            id: nanoid(),
            timestamp: new Date().toISOString(),
          };
          return { logs: [...state.logs, newLog] };
        }),

      // Getter for all logs
      getLogs: () => get().logs,
    }),
    {
      name: "transparency-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// /store/useTransparencyStore.ts (extend existing)
export const selectLogs = (s: TransparencyState) => s.logs;

export const selectStats = (s: TransparencyState): TransparencyStats => {
  const total = s.logs.length;
  const bySeverity = s.logs.reduce(
    (acc, l) => ({
      ...acc,
      [l.severity ?? "info"]: (acc[l.severity ?? "info"] || 0) + 1,
    }),
    {} as Record<Severity, number>
  );
  const byType = s.logs.reduce(
    (acc, l) => ({ ...acc, [l.type]: (acc[l.type] || 0) + 1 }),
    {} as Record<LogType, number>
  );
  const recentCritical = s.logs
    .filter((l) => l.severity === "critical")
    .slice(-5)
    .reverse();

  return { total, bySeverity, byType, recentCritical };
};
