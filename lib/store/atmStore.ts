import { create } from "zustand";
import mockAtms from "../mockAtms";
import { atmApi } from "../api/endpoints";
import isATMArray from "../utils/isAlertArray";

export type AtmStore = {
  atms: ATM[];
  loading: boolean;
  setAtms: (atms: ATM[]) => void;
  updateAtm: (id: string, patch: Partial<ATM>) => void;
  refresh: () => Promise<void>;
  seed: () => void;
  getById: (id: string) => ATM | undefined;
};

export const useAtmStore = create<AtmStore>((set, get) => ({
  atms: mockAtms,
  loading: false,
  setAtms: (atms: ATM[]) => set({ atms }),
  updateAtm: (id: string, patch: Partial<ATM>) =>
    set((state) => ({
      atms: state.atms.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),
  refresh: async () => {
    set({ loading: true });
    try {
      const {
        data: { data },
      } = await atmApi.getAll();

      if (isATMArray(data)) {
        set({ atms: data });
      } else {
        console.warn("Invalid ATM data received; keeping previous state.");
      }
    } catch (e) {
      // keep existing mocked data on failure
      console.warn("ATM refresh failed, keeping local data.", e);
    } finally {
      set({ loading: false });
    }
  },
  seed: () => set({ atms: mockAtms }),
  getById: (id: string) => get().atms?.find((a) => a.id === id),
}));

// Selectors for typed usage in components (avoid inline implicit any)
export const selectAtms = (s: AtmStore) => s.atms;
export const selectLoading = (s: AtmStore) => s.loading;
export const selectGetById = (id: string) => {
  if (!id) return;
  return (s: AtmStore) => s.atms?.find((a) => a.id === id) ?? null;
};

export default useAtmStore;
