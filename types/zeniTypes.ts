import { JSX } from "react";
export type ZeniIntent =
  | "downloadReport"
  | "startOnboarding"
  | "analyzeDowntime"
  | "viewLogs"
  | "dispatchEngineer"
  | "showHelp"
  | "navigate"
  | "unknown";

export interface AIThinkerObject {
  intent: ZeniIntent;
  targetStores?: string[];
  excludedStores?: string[];
  actions?: string[];
  requiredData?: string[];
  nextQuery?: string;
}

export interface ActionObject {
  userResponse: string;
  executionSteps?: string[];
  resultType?: "text" | "chart" | "pdf" | "table" | "link" | "info";
  data?: any;
}

export interface ZeniMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | JSX.Element;
  timestamp: string;
}

export interface ZeniState {
  messages: ZeniMessage[];
  isLoading: boolean;
  context?: AIThinkerObject;
  sendMessage: (input: string) => Promise<void>;
  clearChat: () => void;
}
