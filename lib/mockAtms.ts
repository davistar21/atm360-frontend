const banks = [
  { id: "ZENITH-001", name: "Zenith Bank" },
  { id: "GTB-002", name: "GTBank" },
  { id: "ACCESS-003", name: "Access Bank" },
  { id: "UBA-004", name: "UBA" },
  { id: "FIRST-005", name: "First Bank" },
  { id: "FID-006", name: "Fidelity Bank" },
];

const neighborhoods = [
  { branch: "Victoria Island", lat: 6.428, lng: 3.4219 },
  { branch: "Lekki Phase 1", lat: 6.4474, lng: 3.4705 },
  { branch: "Ikeja", lat: 6.6018, lng: 3.3515 },
  { branch: "Surulere", lat: 6.4969, lng: 3.3612 },
  { branch: "Yaba", lat: 6.5074, lng: 3.3801 },
  { branch: "Ikoyi", lat: 6.4356, lng: 3.4215 },
  { branch: "Apapa", lat: 6.4482, lng: 3.3611 },
  { branch: "Ajah", lat: 6.488, lng: 3.562 },
];

const statuses: ATM["status"][] = ["ONLINE", "OFFLINE", "MAINTENANCE"];

export const mockAtms: ATM[] = Array.from({ length: 50 }).map((_, i) => {
  const bank = banks[i % banks.length];
  const neighborhood = neighborhoods[i % neighborhoods.length];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const totalCapacity = 15000000 + Math.floor(Math.random() * 5000000);
  const currentAmount = Math.floor(Math.random() * totalCapacity);

  return {
    id: `ATM-LAG-${String(i + 1).padStart(4, "0")}`,
    bankId: bank.id,
    location: {
      branchName: `${bank.name} - ${neighborhood.branch}`,
      address: `${Math.floor(Math.random() * 200 + 1)} ${
        neighborhood.branch
      } Street, Lagos`,
      lga: neighborhood.branch,
      state: "Lagos",
      coordinates: {
        lat: neighborhood.lat + Math.random() * 0.005,
        lng: neighborhood.lng + Math.random() * 0.005,
      },
    },
    model: ["NCR SelfServ 80", "Diebold Opteva 520"][
      Math.floor(Math.random() * 2)
    ],
    type: "FULL_FUNCTION",
    status,
    lastUpdated: new Date().toISOString(),
    networkStatus: status === "OFFLINE" ? "DISCONNECTED" : "CONNECTED",
    cashLevel: {
      totalCapacity,
      currentAmount,
      lowThreshold: Math.floor(totalCapacity * 0.25),
      emptyThreshold: Math.floor(totalCapacity * 0.05),
    },
    powerStatus: {
      mains: Math.random() > 0.1,
      generator: Math.random() > 0.7,
      inverter: true,
      fuelLevel: Math.floor(Math.random() * 100),
    },
    telemetry: {
      temperatureC: 24 + Math.floor(Math.random() * 5),
      errorCodes: status === "OFFLINE" ? ["E404"] : [],
    },
    predictiveScore: {
      failureRisk:
        status === "ONLINE" ? Math.random() * 0.2 : Math.random() * 0.8,
      cashOutRisk: Math.random(),
      networkFailureRisk: status === "OFFLINE" ? 0.8 : Math.random() * 0.2,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

export default mockAtms;
