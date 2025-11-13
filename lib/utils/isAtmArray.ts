function isATM(obj: any): obj is ATM {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.bankId === "string" &&
    typeof obj.location === "object" &&
    typeof obj.location?.address === "string" &&
    typeof obj.location?.coordinates?.lat === "number" &&
    typeof obj.location?.coordinates?.lng === "number" &&
    typeof obj.model === "string" &&
    [
      "CASH_DISPENSER",
      "FULL_FUNCTION",
      "DEPOSIT_ONLY",
      "WITHDRAWAL_ONLY",
    ].includes(obj.type) &&
    ["ONLINE", "OFFLINE", "OUT_OF_CASH", "MAINTENANCE", "UNKNOWN"].includes(
      obj.status
    ) &&
    typeof obj.lastUpdated === "string"
  );
}

export default function isATMArray(data: any): data is ATM[] {
  return Array.isArray(data) && data.every(isATM);
}
