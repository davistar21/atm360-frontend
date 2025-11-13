import { create } from "zustand";
import { ticketApi } from "../api/endpoints";
import { persist } from "zustand/middleware";

// Mock data for initial store state
const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    atmId: "ATM-LAG-0001",
    engineerId: "ENG-001",
    reportedBy: "SYSTEM",
    issueType: "NETWORK_ISSUE",
    severity: "HIGH",
    description: "Card reader malfunction - cards being retained",
    status: "IN_PROGRESS",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TKT-002",
    atmId: "ATM-LAG-0004",
    reportedBy: "CUSTOMER",
    issueType: "SCREEN_FAILURE",
    severity: "CRITICAL",
    description: "Network connectivity issues - intermittent offline status",
    status: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TKT-003",
    atmId: "ATM-LAG-0003",
    engineerId: "ENG-002",
    reportedBy: "BRANCH_MANAGER",
    issueType: "SCREEN_FAILURE",
    severity: "MEDIUM",
    description: "Scheduled maintenance - monthly servicing",
    status: "CLOSED",
    resolution: {
      summary: "Completed monthly maintenance checks",
      resolvedAt: new Date().toISOString(),
      timeSpentMinutes: 45,
      proofPhotoUrl: "data:image/jpeg;base64,...",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type TicketStore = {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  // Actions
  setTickets: (tickets: Ticket[]) => void;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  createTicket: (
    ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">
  ) => Promise<Ticket>;
  assignTicket: (id: string, engineerId: string) => Promise<void>;
  resolveTicket: (id: string, resolution: TicketResolution) => Promise<void>;
  refresh: () => Promise<void>;
  seed: () => void;
  // Queries
  getById: (id: string) => Ticket | undefined;
  getByAtmId: (atmId: string) => Ticket[];
  getByStatus: (status: Ticket["status"]) => Ticket[];
  // getByEngineer: (engineerId: string) => Ticket[];
};

export const useTicketStore = create<TicketStore>()(
  persist(
    (set, get) => ({
      tickets: mockTickets,
      loading: false,
      error: null,

      setTickets: (tickets) => set({ tickets }),

      updateTicket: (id, patch) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id
              ? { ...t, ...patch, updatedAt: new Date().toISOString() }
              : t
          ),
        })),

      createTicket: async (ticket) => {
        const newTicket = {
          ...ticket,
          id: `TKT-${String(get().tickets.length + 1).padStart(3, "0")}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          tickets: [...state.tickets, newTicket],
        }));
        return newTicket;
      },

      assignTicket: async (id, engineerId) => {
        try {
          const {
            data: { data },
          } = await ticketApi.assign(id, engineerId);
          set((state) => ({
            tickets: state.tickets.map((t) => (t.id === id ? data : t)),
          }));
        } catch (e) {
          const error =
            e instanceof Error ? e.message : "Failed to assign ticket";
          set({ error });
          throw new Error(error);
        }
      },

      resolveTicket: async (id, resolution) => {
        try {
          // const {
          //   data: { data },
          // } = await ticketApi.resolve(id, resolution);
          set((state) => ({
            tickets: state.tickets.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "RESOLVED",
                    resolution: { ...resolution },
                    updatedAt: new Date().toISOString(),
                  }
                : t
            ),
          }));
        } catch (e) {
          const error =
            e instanceof Error ? e.message : "Failed to resolve ticket";
          set({ error });
          throw new Error(error);
        }
      },

      refresh: async () => {
        set({ loading: true, error: null });
        try {
          const {
            data: { data },
          } = await ticketApi.getAll();
          set({ tickets: data });
        } catch (e) {
          const error =
            e instanceof Error ? e.message : "Failed to fetch tickets";
          set({ error });
          console.warn("Ticket refresh failed, keeping local data.", e);
        } finally {
          set({ loading: false });
        }
      },

      seed: () => set({ tickets: mockTickets }),

      // Query methods
      getById: (id) => get().tickets.find((t) => t.id === id),
      getByAtmId: (atmId) => get().tickets.filter((t) => t.atmId === atmId),
      getByStatus: (status) => get().tickets.filter((t) => t.status === status),
      // getByEngineer: (engineerId) =>
      //   get().tickets.filter((t) => t.assignedTo === engineerId),
    }),
    {
      name: "ticket-store",
    }
  )
);

// Typed selectors for components
export const selectTickets = (s: TicketStore) => s.tickets;
export const selectLoading = (s: TicketStore) => s.loading;
export const selectError = (s: TicketStore) => s.error;
export const selectGetById = (id: string) => (s: TicketStore) =>
  s.tickets?.find((t) => t.id === id) ?? null;
export const selectByAtmId = (atmId: string) => (s: TicketStore) =>
  s.tickets?.filter((t) => t.atmId === atmId);
export const selectByStatus = (status: Ticket["status"]) => (s: TicketStore) =>
  s.tickets?.filter((t) => t.status === status);
export const selectByEngineer = (engineerId: string) => (s: TicketStore) =>
  s.tickets?.filter((t) => t.engineerId === engineerId);

export default useTicketStore;
