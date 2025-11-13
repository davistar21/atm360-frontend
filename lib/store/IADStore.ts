// lib/stores/iadStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
export type IADPerson = {
  id: string;
  name: string;
  role:
    | "REPRESENTATIVE"
    | "ENGINEER"
    | "SUPPORT"
    | "COMPLIANCE OFFICER"
    | "CASH REPLENISHMENT AGENT"
    | "SECURITY OFFICER"
    | "OTHER";
  phone?: string;
  email?: string;
};

export type IADDetails = {
  id: string;
  name: string;
  licenseNumber?: string;
  ninssRegistered?: boolean;
  switchPartners?: string[]; // e.g., ["Interswitch","eTranzact"]
  address?: string;
  contactPerson?: string;
};

type IADState = {
  current: IADDetails | null;
  verificationStatus: "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED";
  connected: boolean;
  personnel: IADPerson[];
  syncLogs: Array<{ id: string; ts: string; message: string }>;
  setCurrent: (d: IADDetails | null) => void;
  setVerificationStatus: (s: IADState["verificationStatus"]) => void;
  setConnected: (c: boolean) => void;
  addPerson: (p: IADPerson) => void;
  removePerson: (id: string) => void;
  addSyncLog: (msg: string) => void;
  seedMock: () => void;
};

export const useIADStore = create<IADState>()(
  persist(
    (set, get) => ({
      current: null,
      verificationStatus: "NOT_STARTED",
      connected: false,
      personnel: [],
      syncLogs: [],
      setCurrent: (d) => set({ current: d }),
      setVerificationStatus: (s) => set({ verificationStatus: s }),
      setConnected: (c) => set({ connected: c }),
      addPerson: (p) => set((s) => ({ personnel: [...s.personnel, p] })),
      removePerson: (id) =>
        set((s) => ({ personnel: s.personnel.filter((x) => x.id !== id) })),
      addSyncLog: (message) =>
        set((s) => ({
          syncLogs: [
            { id: crypto.randomUUID(), ts: new Date().toISOString(), message },
            ...s.syncLogs,
          ],
        })),
      seedMock: () => {
        if (!get().current) return;
        set({
          current: {
            id: "IAD-001",
            name: "Global ATM Deployers Ltd",
            licenseNumber: "CBN-IAD-2023-889",
            ninssRegistered: true,
            switchPartners: ["Interswitch", "eTranzact"],
            address: "Plot 5, Industrial Avenue, Lagos",
            contactPerson: "Mrs. A. Okonkwo",
          },
          verificationStatus: "NOT_STARTED",
          connected: false,
          personnel: [
            {
              id: "p1",
              name: "Chinedu Okoro",
              role: "REPRESENTATIVE",
              phone: "+2348010000001",
              email: "chinedu@globaliad.ng",
            },
            {
              id: "p2",
              name: "Aisha Bello",
              role: "ENGINEER",
              phone: "+2348010000002",
              email: "aisha@globaliad.ng",
            },
          ],
          syncLogs: [],
        });
      },
    }),
    {
      name: "iad-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
