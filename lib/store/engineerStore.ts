// /store/useEngineerStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type EngineerStatus = "available" | "busy" | "on_break";

export interface Engineer {
  id: string;
  name: string;
  surname: string;
  phone: string;
  location: {
    city: string;
    area: string;
    coordinates: { lat: number; lng: number };
  };
  status: EngineerStatus;
  availability: boolean;
  firstTimeFixRate: number; // %
  ongoingTask?: string; // ticket id
}

type EngineerStore = {
  engineers: Engineer[];
  getAvailableEngineers: () => Engineer[];
  assignEngineer: (id: string, ticketId: string) => void;
  releaseEngineer: (id: string) => void;
  getById: (id: string) => Engineer | undefined;
};
const mockEngineers: Engineer[] = [
  {
    id: "ENG-001",
    name: "Ayo",
    surname: "Olawale",
    phone: "234805716180",
    location: {
      city: "Lagos",
      area: "Victoria Island",
      coordinates: { lat: 6.4281, lng: 3.4219 },
    },
    status: "available",
    availability: true,
    firstTimeFixRate: 94,
  },
  {
    id: "ENG-002",
    name: "Chidi",
    surname: "Nwosu",
    phone: "234805716180",
    location: {
      city: "Lagos",
      area: "Ikeja",
      coordinates: { lat: 6.6018, lng: 3.3515 },
    },
    status: "available",
    availability: true,
    firstTimeFixRate: 88,
  },
  {
    id: "ENG-003",
    name: "Fatima",
    surname: "Sule",
    phone: "234805716180",
    location: {
      city: "Lagos",
      area: "Yaba",
      coordinates: { lat: 6.5074, lng: 3.3801 },
    },
    status: "busy",
    availability: false,
    firstTimeFixRate: 91,
    ongoingTask: "TKT-003",
  },
  {
    id: "ENG-004",
    name: "Tunde",
    surname: "Bamgboye",
    phone: "234805716180",
    location: {
      city: "Lagos",
      area: "Lekki Phase 1",
      coordinates: { lat: 6.4474, lng: 3.4705 },
    },
    status: "available",
    availability: true,
    firstTimeFixRate: 97,
  },
  {
    id: "ENG-005",
    name: "Ngozi",
    surname: "Okoro",
    phone: "234805716180",
    location: {
      city: "Lagos",
      area: "Surulere",
      coordinates: { lat: 6.4969, lng: 3.3612 },
    },
    status: "on_break",
    availability: false,
    firstTimeFixRate: 92,
  },
];

export const useEngineerStore = create<EngineerStore>()(
  persist(
    (set, get) => ({
      engineers: mockEngineers,

      getAvailableEngineers: () =>
        get().engineers.filter(
          (e) => e.availability && e.status === "available"
        ),

      assignEngineer: (id, ticketId) =>
        set((state) => ({
          engineers: state.engineers.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "busy",
                  availability: false,
                  ongoingTask: ticketId,
                }
              : e
          ),
        })),

      releaseEngineer: (id) =>
        set((state) => ({
          engineers: state.engineers.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "available",
                  availability: true,
                  ongoingTask: undefined,
                }
              : e
          ),
        })),
      getById: (id) => get().engineers.find((e) => e.id === id),
    }),
    {
      name: "engineer-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
