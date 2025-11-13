import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface GuideStep {
  id: string;
  target: string; // CSS selector or data attribute
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  route: string; // Which route this step belongs to
}

export interface GuideRoute {
  route: string;
  steps: GuideStep[];
}

type GuideStore = {
  isActive: boolean;
  currentRouteIndex: number;
  currentStepIndex: number;
  completedRoutes: string[];
  startGuide: () => void;
  stopGuide: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToRoute: (route: string) => void;
  completeRoute: (route: string) => void;
  getCurrentStep: () => GuideStep | null;
  getCurrentRoute: () => string | null;
};

const guideRoutes: GuideRoute[] = [
  {
    route: "/ops",
    steps: [
      {
        id: "overview-1",
        target: "[data-guide='sidebar']",
        title: "Navigation Sidebar",
        content:
          "Use the sidebar to navigate between different sections of the dashboard.",
        position: "right",
        route: "/ops",
      },
      {
        id: "overview-2",
        target: "[data-guide='top-nav']",
        title: "Top Navigation",
        content:
          "View the current page title and access your profile settings from here.",
        position: "bottom",
        route: "/ops",
      },
      {
        id: "overview-3",
        target: "[data-guide='filters']",
        title: "Filters",
        content:
          "Use these filters to adjust the time range and filter ATMs by status.",
        position: "bottom",
        route: "/ops",
      },
      {
        id: "overview-4",
        target: "[data-guide='kpi-cards']",
        title: "Key Performance Indicators",
        content:
          "Monitor key metrics at a glance: Active ATMs, Network Uptime, MTTR, and Active Tickets.",
        position: "bottom",
        route: "/ops",
      },
      {
        id: "overview-5",
        target: "[data-guide='network-uptime']",
        title: "Network Uptime",
        content:
          "Track the percentage of ATMs currently online and operational across your network.",
        position: "top",
        route: "/ops",
      },
      {
        id: "overview-6",
        target: "[data-guide='activity-chart']",
        title: "Activity Chart",
        content:
          "View monthly activity trends and transaction patterns over time.",
        position: "left",
        route: "/ops",
      },
    ],
  },
  {
    route: "/ops/map",
    steps: [
      {
        id: "map-1",
        target: "[data-guide='atm-map']",
        title: "ATM Map View",
        content:
          "View all ATMs on an interactive map. Click on markers to see ATM details and status.",
        position: "top",
        route: "/ops/map",
      },
      {
        id: "map-2",
        target: "[data-guide='sidebar']",
        title: "Navigation",
        content:
          "You can navigate to other sections using the sidebar at any time.",
        position: "right",
        route: "/ops/map",
      },
    ],
  },
  {
    route: "/ops/activity",
    steps: [
      {
        id: "activity-1",
        target: "[data-guide='activity-header']",
        title: "Activity Monitor",
        content:
          "Monitor real-time ATM activity, logs, and AI-generated alerts.",
        position: "bottom",
        route: "/ops/activity",
      },
      {
        id: "activity-2",
        target: "[data-guide='activity-tabs']",
        title: "Activity Tabs",
        content:
          "Switch between Overview, Activity Logs, and AI Alerts to view different activity data.",
        position: "bottom",
        route: "/ops/activity",
      },
      {
        id: "activity-3",
        target: "[data-guide='activity-search']",
        title: "Search & Filter",
        content:
          "Search logs by ATM ID or message, and filter by status (success, warning, error).",
        position: "bottom",
        route: "/ops/activity",
      },
    ],
  },
  {
    route: "/ops/alerts",
    steps: [
      {
        id: "alerts-1",
        target: "[data-guide='alert-list']",
        title: "Alerts Dashboard",
        content:
          "View and manage all active alerts. Alerts are automatically generated based on ATM status and conditions.",
        position: "top",
        route: "/ops/alerts",
      },
      {
        id: "alerts-2",
        target: "[data-guide='alert-actions']",
        title: "Alert Actions",
        content:
          "Acknowledge alerts, view details, and track resolution status for each alert.",
        position: "top",
        route: "/ops/alerts",
      },
    ],
  },
  {
    route: "/ops/reports",
    steps: [
      {
        id: "reports-1",
        target: "[data-guide='reports-header']",
        title: "Operations Report",
        content:
          "Generate comprehensive reports on ATM operations, performance, and metrics.",
        position: "bottom",
        route: "/ops/reports",
      },
      {
        id: "reports-2",
        target: "[data-guide='download-pdf']",
        title: "Download PDF",
        content:
          "Download a detailed PDF report of all operations data for sharing or archiving.",
        position: "left",
        route: "/ops/reports",
      },
      {
        id: "reports-3",
        target: "[data-guide='report-metrics']",
        title: "Report Metrics",
        content:
          "View key metrics including active ATMs, transactions, uptime, and performance trends.",
        position: "top",
        route: "/ops/reports",
      },
    ],
  },
  {
    route: "/ops/management",
    steps: [
      {
        id: "management-1",
        target: "[data-guide='management-header']",
        title: "Management Console",
        content:
          "Admin console for managing ATMs, branches, issues, and system configuration.",
        position: "bottom",
        route: "/ops/management",
      },
      {
        id: "management-2",
        target: "[data-guide='management-tabs']",
        title: "Management Tabs",
        content:
          "Switch between ATMs, Branches, Log Issues, and Configuration tabs to manage different aspects.",
        position: "bottom",
        route: "/ops/management",
      },
      {
        id: "management-3",
        target: "[data-guide='bulk-import']",
        title: "Bulk Import",
        content:
          "Import ATMs, branches, or cash logs in bulk using CSV or Excel files.",
        position: "left",
        route: "/ops/management",
      },
      {
        id: "management-4",
        target: "[data-guide='api-key']",
        title: "API Key",
        content:
          "Your API key for integrating with external systems. Keep it secure.",
        position: "bottom",
        route: "/ops/management",
      },
    ],
  },
];

export const useGuideStore = create<GuideStore>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentRouteIndex: 0,
      currentStepIndex: 0,
      completedRoutes: [],

      startGuide: () => {
        set({
          isActive: true,
          currentRouteIndex: 0,
          currentStepIndex: 0,
        });
      },

      stopGuide: () => {
        set({
          isActive: false,
          currentRouteIndex: 0,
          currentStepIndex: 0,
        });
      },

      nextStep: () => {
        const state = get();
        const currentRoute = guideRoutes[state.currentRouteIndex];
        if (!currentRoute) return;

        // Check if there are more steps in current route
        if (state.currentStepIndex < currentRoute.steps.length - 1) {
          set({ currentStepIndex: state.currentStepIndex + 1 });
        } else {
          // Move to next route
          if (state.currentRouteIndex < guideRoutes.length - 1) {
            set({
              currentRouteIndex: state.currentRouteIndex + 1,
              currentStepIndex: 0,
            });
          } else {
            // Tour completed
            get().stopGuide();
          }
        }
      },

      previousStep: () => {
        const state = get();
        if (state.currentStepIndex > 0) {
          set({ currentStepIndex: state.currentStepIndex - 1 });
        } else if (state.currentRouteIndex > 0) {
          // Move to previous route
          const prevRoute = guideRoutes[state.currentRouteIndex - 1];
          set({
            currentRouteIndex: state.currentRouteIndex - 1,
            currentStepIndex: prevRoute.steps.length - 1,
          });
        }
      },

      goToRoute: (route: string) => {
        const routeIndex = guideRoutes.findIndex((r) => r.route === route);
        if (routeIndex !== -1) {
          set({
            currentRouteIndex: routeIndex,
            currentStepIndex: 0,
          });
        }
      },

      completeRoute: (route: string) => {
        const state = get();
        if (!state.completedRoutes.includes(route)) {
          set({
            completedRoutes: [...state.completedRoutes, route],
          });
        }
      },

      getCurrentStep: () => {
        const state = get();
        const currentRoute = guideRoutes[state.currentRouteIndex];
        if (!currentRoute) return null;
        return currentRoute.steps[state.currentStepIndex] || null;
      },

      getCurrentRoute: () => {
        const state = get();
        const currentRoute = guideRoutes[state.currentRouteIndex];
        return currentRoute?.route || null;
      },
    }),
    {
      name: "guide-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        completedRoutes: state.completedRoutes,
      }),
    }
  )
);

export { guideRoutes };
