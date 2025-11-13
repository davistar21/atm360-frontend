// /lib/ai/zeniProcessor.ts
import chat from "@/lib/ai";
import { AIThinkerObject, ActionObject } from "@/types/zeniTypes";

/**
 * Utility: extract JSON from a model reply (handles code fences or inline JSON)
 */
function extractJson(text?: string): any | null {
  if (!text) return null;
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = codeBlockMatch ? codeBlockMatch[1] : text;
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    // try to find first { ... } substring
    const firstBrace = jsonText.indexOf("{");
    const lastBrace = jsonText.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(jsonText.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Stage 1 prompt: intent + required data.
 * We keep the prompt small but explicit and include a short description of ATM360 and admin flows.
 */
const STAGE1_SYSTEM_PROMPT = `
You are "Zeni", an operations assistant for ATM360 (Zenith-style operations).
Goal: Convert a user's natural language request into a compact, structured AIThinkerObject (JSON only).
Rules:
 - Respond only with valid JSON (no prose) representing AIThinkerObject.
 - If the intent is unclear, return intent "clarify" and include "clarifyQuestion".
 - Do not refuse; if an action cannot be run now, suggest a concrete fallback action (simulate, mock, or explain next best step) as "fallbackAction".
ATM360 context (short): ATM360 monitors ATM telemetry, creates tickets, dispatches engineers, collects proofs, and logs actions for audit. Admins can request reports, dispatch, run pilot flows, and view logs.
Output shape:
{
 "intent": string,
 "targetStores": string[],
 "actions": string[], // suggested action steps (e.g., "redirectToPage('/ops/reports')", "createTicket({atmId:'ATM-LAG-0002', issue:'NETWORK'})")
 "requiredData": string[], // e.g., ["dateRange","atmId"]
 "nextQuery": string, // prompt for stage2
 "clarifyQuestion"?: string,
 "fallbackAction"?: string
}
`;

/**
 * Stage 2 prompt: Action generation with RAG.
 * We pass in a compact store snapshot. The model must include 'storeDataUsed' listing which parts of snapshot it read.
 */
const STAGE2_SYSTEM_PROMPT = (
  thinker: AIThinkerObject,
  snapshotSummary: string
) => `
You are "Zeni" continuing from Stage 1.
Stage1 result: ${JSON.stringify(thinker)}

Store snapshot (limited, trusted, direct data) — use it for reasoning. Only use fields necessary to complete requested actions. Snapshot:
${snapshotSummary}

Instructions:
 - Produce a single valid JSON ActionObject (no extra text).
 - Use at most the last 5 relevant records for any store.
 - Include "storeDataUsed": an array of keys you read from the snapshot (e.g., ["tickets.last5","atm.ATM-LAG-0004"]).
 - If the requested action cannot be executed (no permissions or missing live API), produce a practical fallback (simulate, mock data creation, provide UI steps).
 - Always be helpful. Never respond "I can't" or "I don't know". Instead propose a next-best-step, simulation, or manual instruction.
ActionObject shape:
{
 "userResponse": string,
 "executionSteps": string[],  // exact function calls or UI redirects the front end can perform
 "resultType": "text"|"chart"|"pdf"|"table"|"link"|"info",
 "data": any,
 "storeDataUsed": string[],
 "warnings"?: string[] // optional notes (e.g., "live API not available; simulated results")
}
`;

/**
 * Stage 1: parse intent (with optional snapshot hint)
 */
export async function processZeniStage1(
  userInput: string,
  snapshotSummary?: string
): Promise<AIThinkerObject | null> {
  const prompt = `${STAGE1_SYSTEM_PROMPT}
User: """${userInput}"""
${snapshotSummary ? `\nContext snapshot: ${snapshotSummary}` : ""}

Return JSON now.
`;
  const resp = await chat(prompt);
  const parsed = extractJson(resp?.content);
  if (!parsed) return null;
  // Basic shape validation (best-effort)
  return {
    intent: parsed.intent ?? "unknown",
    targetStores: parsed.targetStores ?? [],
    actions: parsed.actions ?? [],
    requiredData: parsed.requiredData ?? [],
    nextQuery: parsed.nextQuery ?? "",
    ...(parsed.clarifyQuestion
      ? { clarifyQuestion: parsed.clarifyQuestion }
      : {}),
    ...(parsed.fallbackAction ? { fallbackAction: parsed.fallbackAction } : {}),
  } as AIThinkerObject;
}

/**
 * Stage 2: final actionable response. Provide snapshot for RAG.
 */
export async function processZeniStage2(
  thinker: AIThinkerObject,
  snapshot: Record<string, any> | null
): Promise<ActionObject | null> {
  // Serialize snapshot into a compact summary (string), limiting length
  const snapshotSummary = snapshot
    ? JSON.stringify(snapshot, null, 2).slice(0, 12_000) // cap size
    : "NONE";

  const prompt = STAGE2_SYSTEM_PROMPT(thinker, snapshotSummary);

  const resp = await chat(prompt);

  const parsed = extractJson(resp?.content);
  if (!parsed) {
    // fallback: ask model for a helpful text response instead of JSON
    const fallbackText = resp?.content ?? "No response";
    return {
      userResponse: `I prepared a suggested next step: ${fallbackText}`,
      executionSteps: [],
      resultType: "text",
      data: { raw: fallbackText },
      storeDataUsed: [],
      warnings: ["ActionObject parse failed; returned helpful fallback text."],
    } as ActionObject;
  }

  // Ensure fields exist
  return {
    userResponse: parsed.userResponse ?? "Here is the result.",
    executionSteps: parsed.executionSteps ?? [],
    resultType: parsed.resultType ?? "text",
    data: parsed.data ?? null,
    storeDataUsed: parsed.storeDataUsed ?? [],
    warnings: parsed.warnings ?? [],
  } as ActionObject;
}
