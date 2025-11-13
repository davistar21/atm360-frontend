import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "admin" | "engineer" | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: true,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch("http://localhost:4000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response
              .json()
              .catch(() => ({ message: "Invalid credentials" }));
            throw new Error(error.message || "Login failed");
          }

          const data = await response.json();

          const user: User = {
            id: data.id || "temp-id",
            email: email,
            name: data.name || email.split("@")[0] || "User",
            role: data.role?.toLowerCase() === "admin" ? "admin" : "engineer", // normalize
          };

          const token = data.token;

          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const mockAtms: ATM[] = [
  {
    id: "ATM-LAG-0001",
    bankId: "ZENITH-001",
    location: {
      branchName: "Zenith Bank - Victoria Island",
      address: "Plot 84, Ajose Adeogun Street, Victoria Island, Lagos",
      lga: "Eti-Osa",
      state: "Lagos",
      coordinates: {
        lat: 6.4281,
        lng: 3.4219,
      },
    },
    model: "NCR SelfServ 80",
    type: "FULL_FUNCTION",
    status: "ONLINE",
    lastUpdated: new Date().toISOString(),
    networkStatus: "CONNECTED",
    cashLevel: {
      totalCapacity: 20000000,
      currentAmount: 15000000,
      lowThreshold: 5000000,
      emptyThreshold: 1000000,
    },
    powerStatus: {
      mains: true,
      generator: false,
      inverter: true,
      fuelLevel: 80,
    },
    telemetry: {
      temperatureC: 25,
      errorCodes: [],
    },
    predictiveScore: {
      failureRisk: 0.1,
      cashOutRisk: 0.2,
      networkFailureRisk: 0.1,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ATM-LAG-0002",
    bankId: "ZENITH-001",
    location: {
      branchName: "Zenith Bank - Lekki Phase 1",
      address: "4 Admiralty Way, Lekki Phase 1, Lagos",
      lga: "Eti-Osa",
      state: "Lagos",
      coordinates: {
        lat: 6.4474,
        lng: 3.4705,
      },
    },
    model: "NCR SelfServ 80",
    type: "FULL_FUNCTION",
    status: "ONLINE",
    lastUpdated: new Date().toISOString(),
    networkStatus: "CONNECTED",
    cashLevel: {
      totalCapacity: 20000000,
      currentAmount: 18000000,
      lowThreshold: 5000000,
      emptyThreshold: 1000000,
    },
    powerStatus: {
      mains: true,
      generator: false,
      inverter: true,
    },
    telemetry: {
      temperatureC: 24,
      errorCodes: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ATM-LAG-0003",
    bankId: "ZENITH-001",
    location: {
      branchName: "Zenith Bank - Ikeja",
      address: "45 Allen Avenue, Ikeja, Lagos",
      lga: "Ikeja",
      state: "Lagos",
      coordinates: {
        lat: 6.6018,
        lng: 3.3515,
      },
    },
    model: "Diebold Opteva 520",
    type: "FULL_FUNCTION",
    status: "MAINTENANCE",
    lastUpdated: new Date().toISOString(),
    networkStatus: "CONNECTED",
    cashLevel: {
      totalCapacity: 15000000,
      currentAmount: 12000000,
      lowThreshold: 4000000,
      emptyThreshold: 1000000,
    },
    powerStatus: {
      mains: true,
      generator: false,
      inverter: true,
    },
    telemetry: {
      temperatureC: 26,
      errorCodes: ["E301"],
      lastErrorTimestamp: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ATM-LAG-0004",
    bankId: "ZENITH-001",
    location: {
      branchName: "Zenith Bank - Yaba",
      address: "142 Herbert Macaulay Way, Yaba, Lagos",
      lga: "Yaba",
      state: "Lagos",
      coordinates: {
        lat: 6.5074,
        lng: 3.3801,
      },
    },
    model: "NCR SelfServ 80",
    type: "FULL_FUNCTION",
    status: "OFFLINE",
    lastUpdated: new Date().toISOString(),
    networkStatus: "DISCONNECTED",
    cashLevel: {
      totalCapacity: 20000000,
      currentAmount: 16000000,
      lowThreshold: 5000000,
      emptyThreshold: 1000000,
    },
    powerStatus: {
      mains: false,
      generator: true,
      inverter: true,
      fuelLevel: 45,
    },
    telemetry: {
      temperatureC: 28,
      errorCodes: ["E404", "D303"],
      lastErrorTimestamp: new Date().toISOString(),
    },
    predictiveScore: {
      failureRisk: 0.7,
      cashOutRisk: 0.3,
      networkFailureRisk: 0.8,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ATM-LAG-0005",
    bankId: "ZENITH-001",
    location: {
      branchName: "Zenith Bank - Surulere",
      address: "89 Adeniran Ogunsanya Street, Surulere, Lagos",
      lga: "Surulere",
      state: "Lagos",
      coordinates: {
        lat: 6.4969,
        lng: 3.3612,
      },
    },
    model: "NCR SelfServ 80",
    type: "FULL_FUNCTION",
    status: "ONLINE",
    lastUpdated: new Date().toISOString(),
    networkStatus: "CONNECTED",
    cashLevel: {
      totalCapacity: 20000000,
      currentAmount: 19000000,
      lowThreshold: 5000000,
      emptyThreshold: 1000000,
    },
    powerStatus: {
      mains: true,
      generator: false,
      inverter: true,
    },
    telemetry: {
      temperatureC: 25,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
