// /lib/store/useChatbotStore.ts
"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { processZeniStage1, processZeniStage2 } from "@/lib/ai/zeniProcessor";
import {
  AIThinkerObject,
  ActionObject,
  ZeniState,
  ZeniMessage,
} from "@/types/zeniTypes";
import { useTransparencyStore } from "@/lib/store/transparencyStore";
// inside sendMessage in useChatbotStore.ts (update)
import { buildStoreSnapshot } from "@/lib/ai/buildStoreSnapshot";

export const useChatbotStore = create<ZeniState>((set, get) => ({
  messages: [],
  isLoading: false,
  context: undefined,

  clearChat: () => set({ messages: [] }),

  sendMessage: async (input: string) => {
    // const router = useRouter();
    const router = {};
    const transparency = useTransparencyStore.getState();
    const id = nanoid();
    const userMessage: ZeniMessage = {
      id,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ messages: [...s.messages, userMessage], isLoading: true }));

    try {
      transparency.addLog({
        type: "user-action",
        details: `Zeni prompt: ${input}`,
        severity: "info",
        user: { role: "admin" },
      });

      // ... inside sendMessage:
      const snapshot = buildStoreSnapshot(); // small, focused RAG data
      const thinker = await processZeniStage1(
        input,
        JSON.stringify(snapshot ? { meta: snapshot.meta } : {})
      );
      if (!thinker) throw new Error("AIThinkerObject failed.");

      const action = await processZeniStage2(thinker, snapshot);
      if (!action) throw new Error("ActionObject failed.");

      // Execute safe actions
      await executeZeniActions(action, router);

      // Push assistant message
      const aiMessage: ZeniMessage = {
        id: nanoid(),
        role: "assistant",
        content: action.userResponse,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        messages: [...s.messages, aiMessage],
        context: thinker,
        isLoading: false,
      }));

      transparency.addLog({
        type: "system-event",
        details: `Zeni executed intent: ${thinker.intent}`,
        severity: "info",
      });
    } catch (error: any) {
      console.error(error);
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: nanoid(),
            role: "assistant",
            content: "Sorry, I couldn’t process that command.",
            timestamp: new Date().toISOString(),
          },
        ],
        isLoading: false,
      }));
    }
  },
}));

async function executeZeniActions(action: ActionObject, router: any) {
  if (!action.executionSteps) return;

  for (const step of action.executionSteps) {
    if (step.startsWith("redirectToPage")) {
      const path = step.match(/'(.*?)'/)?.[1];
      if (path) router.push(path);
    }
    if (step.startsWith("downloadReports")) {
      console.log("Mock download triggered:", step);
    }
    if (step.includes("renderTrendChart")) {
      console.log("Render chart for:", action.data);
    }
  }
}
