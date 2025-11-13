// lib/api/iadApi.ts
import type { IADDetails, IADPerson } from "@/lib/store/IADStore";

function wait(ms = 700) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Mock verification: checks license format and simulates NIBSS/CBN checks. */
export async function verifyIAD(
  details: IADDetails
): Promise<{ ok: boolean; reason?: string }> {
  await wait(900);
  // simple mock rule: licenseNumber present and includes "CBN"
  if (!details.licenseNumber)
    return { ok: false, reason: "Missing license number" };
  if (!details.licenseNumber.includes("CBN"))
    return { ok: false, reason: "License not CBN-registered" };
  // simulate NIBSS check pass 95% of time
  if (Math.random() < 0.95) return { ok: true };
  return { ok: false, reason: "NIBSS check failed" };
}

export async function connectIAD(
  details: IADDetails
): Promise<{ ok: boolean; connectionId?: string; message?: string }> {
  await wait(700);
  // simulate success
  return { ok: true, connectionId: `conn-${Date.now()}` };
}

export async function disconnectIAD(
  connectionId: string
): Promise<{ ok: boolean }> {
  await wait(500);
  return { ok: true };
}

export async function syncIADData(
  iadId: string
): Promise<{ ok: boolean; recordsSynced: number; message?: string }> {
  await wait(900);
  return {
    ok: true,
    recordsSynced: Math.floor(Math.random() * 250) + 5,
    message: "Mock sync completed",
  };
}

/** Personnel ops - in real app would POST/DELETE */
export async function addIADPerson(iadId: string, p: IADPerson) {
  await wait(400);
  return { ok: true, id: p.id };
}
export async function removeIADPerson(iadId: string, personId: string) {
  await wait(400);
  return { ok: true };
}
