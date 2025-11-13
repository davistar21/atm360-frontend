import { create } from "zustand";
import { alertApi } from "../api/endpoints";
import isAlertArray from "../utils/isAlertArray";
import { persist } from "zustand/middleware";

type AlertStore = {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  // Actions
  loadAlerts: () => void;
  setAlerts: (alerts: Alert[]) => void;
  acknowledgeAlert: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

export const mockAlerts: Alert[] = [
  {
    id: "1",
    atmId: "ATM-LAG-0001",
    type: "CASH_LOW",
    severity: "HIGH",
    message: "Cash levels below 15%. Refill required soon.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    acknowledged: true,
    prediction: {
      reasoning:
        "Predicted cash depletion based on historical transaction data.",
      confidence: 0.92,
    },
  },
  {
    id: "2",
    atmId: "ATM-LAG-0004",
    type: "NETWORK_ISSUE",
    severity: "CRITICAL",
    message: "ATM is offline due to network failure.",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    acknowledged: true,
    prediction: {
      reasoning: "Network instability detected over the past 24 hours.",
      confidence: 0.85,
    },
  },
  {
    id: "3",
    atmId: "ATM-LAG-0003",
    type: "CARD_JAM",
    severity: "MEDIUM",
    message: "Card reader jam detected. Manual intervention needed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    acknowledged: false,
    prediction: {
      reasoning: "Frequent card jam reports in this ATM model and location.",
      confidence: 0.78,
    },
  },
  {
    id: "4",
    atmId: "ATM-LAG-0004",
    type: "MAINTENANCE_DUE",
    severity: "LOW",
    message: "Scheduled maintenance due in 3 days.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    acknowledged: false,
    prediction: {
      reasoning: "Maintenance schedule based on system configuration.",
      confidence: 1.0,
    },
  },
  {
    id: "5",
    atmId: "ATM-LAG-0003",
    type: "SECURITY_ALERT",
    severity: "CRITICAL",
    message: "Unauthorized access attempt detected.",
    timestamp: new Date().toISOString(),
    acknowledged: false,
    prediction: {
      reasoning:
        "Pattern analysis of access logs indicating potential threats.",
      confidence: 0.95,
    },
  },
];

export const useAlertStore = create<AlertStore>()(
  persist(
    (set, get) => ({
      alerts: [],
      loading: false,
      error: null,

      loadAlerts: () => {
        if (get().alerts.length > 0) return;
        set({ alerts: mockAlerts });
      },
      setAlerts: (alerts) => set({ alerts }),

      acknowledgeAlert: async (id) => {
        try {
          // const {
          //   data: { data },
          // } = await alertApi.acknowledge(id);

          set((state) => ({
            alerts: state.alerts.map((a) => {
              return a.id === id ? { ...a, acknowledged: true } : a;
            }),
          }));
        } catch (e) {
          const error =
            e instanceof Error ? e.message : "Failed to acknowledge alert";
          set({ error });
          throw new Error(error);
        }
      },

      refresh: async () => {
        set({ loading: true, error: null });
        try {
          get().loadAlerts();
          const {
            data: { data },
          } = await alertApi.getAll();
          if (isAlertArray(data)) {
            set({ alerts: data });
          } else {
            console.warn(
              "Invalid alert data received; keeping previous state."
            );
          }
        } catch (e) {
          const error =
            e instanceof Error ? e.message : "Failed to fetch alerts";
          set({ error });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "alert-store",
    }
  )
);

// Typed selectors
export const selectAlerts = (s: AlertStore) => s.alerts;
export const selectLoading = (s: AlertStore) => s.loading;
export const selectError = (s: AlertStore) => s.error;
export const selectUnacknowledgedAlerts = (s: AlertStore) =>
  s.alerts.filter((a) => !a.acknowledged);

export default useAlertStore;
