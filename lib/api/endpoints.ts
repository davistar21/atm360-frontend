import client from "./client";

// ATM Endpoints
export const atmApi = {
  getAll: () => client.get<ApiResponse<ATM[]>>("/atms"),

  getById: (id: string) => client.get<ApiResponse<ATM>>(`/atms/${id}`),

  update: (id: string, data: Partial<ATM>) =>
    client.patch<ApiResponse<ATM>>(`/atms/${id}`, data),
};

// Ticket Endpoints
export const ticketApi = {
  getAll: () => client.get<ApiResponse<Ticket[]>>("/tickets"),

  getById: (id: string) => client.get<ApiResponse<Ticket>>(`/tickets/${id}`),

  create: (data: Omit<Ticket, "id" | "createdAt" | "updatedAt">) =>
    client.post<ApiResponse<Ticket>>("/tickets", data),

  update: (id: string, data: Partial<Ticket>) =>
    client.patch<ApiResponse<Ticket>>(`/tickets/${id}`, data),

  assign: (id: string, engineerId: string) =>
    client.patch<ApiResponse<Ticket>>(`/tickets/${id}/assign`, { engineerId }),

  resolve: (id: string, resolution: TicketResolution) =>
    client.patch<ApiResponse<Ticket>>(`/tickets/${id}/resolve`, { resolution }),
};

// Alert Endpoints
export const alertApi = {
  getAll: () => client.get<ApiResponse<Alert[]>>("/alerts"),

  acknowledge: (id: string) =>
    client.patch<ApiResponse<Alert>>(`/alerts/${id}/acknowledge`, {
      acknowledged: true,
    }),
};
