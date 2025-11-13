// /lib/ai/buildStoreSnapshot.ts
import { useTicketStore } from "@/lib/store/ticketStore";
import { useAtmStore } from "@/lib/store/atmStore";
import { useAlertStore } from "@/lib/store/alertStore";
import { useEngineerStore } from "@/lib/store/engineerStore";
import { useTransparencyStore } from "@/lib/store/transparencyStore";

/**
 * Build a compact snapshot by pulling a small number of recent records and only selected fields.
 * This function is run synchronously on the server or called from the client store code to produce RAG data.
 */
export function buildStoreSnapshot() {
  try {
    const tickets = useTicketStore
      .getState()
      .tickets.slice(-5)
      .map((t) => ({
        id: t.id,
        atmId: t.atmId,
        status: t.status,
        issueType: t.issueType,
        severity: t.severity,
        createdAt: t.createdAt,
      }));

    const atms = useAtmStore
      .getState()
      .atms.slice(0, 10) // top 10 or all if small
      .map((a) => ({
        id: a.id,
        branchName: a.location.branchName,
        state: a.location.state,
        coordinates: a.location.coordinates,
        status: a.status,
        predictiveScore: a.predictiveScore,
        lastUpdated: a.lastUpdated,
      }));

    const alerts = useAlertStore
      .getState()
      .alerts.slice(-10)
      .map((al) => ({
        id: al.id,
        atmId: al.atmId,
        type: al.type,
        severity: al.severity,
        timestamp: al.timestamp,
      }));

    const engineers = useEngineerStore
      .getState()
      .engineers?.slice(0, 7)
      .map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        firstTimeFixRate: e.firstTimeFixRate,
        location: e.location,
      }));
    const recentLogs = useTransparencyStore
      .getState()
      .logs.slice(-10)
      .map((l) => ({
        id: l.id,
        timestamp: l.timestamp,
        type: l.type,
        severity: l.severity,
      }));

    return {
      tickets: { last5: tickets },
      atms: { sample: atms },
      alerts: { last10: alerts },
      engineers: { sample: engineers },
      logs: { last10: recentLogs },
      meta: { generatedAt: new Date().toISOString() },
    };
  } catch (err) {
    console.warn("buildStoreSnapshot failed", err);
    return null;
  }
}
