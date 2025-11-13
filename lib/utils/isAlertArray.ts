function isAlert(obj: any): obj is Alert {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.atmId === "string" &&
    typeof obj.atmName === "object" &&
    typeof obj.type === "string" &&
    typeof obj.severity === "string" &&
    typeof obj.message === "string" &&
    typeof obj.timestamp === "string" &&
    [
      "CASH_LOW",
      "NETWORK_ISSUE",
      "HARDWARE_ERROR",
      "SECURITY_ALERT",
      "MAINTENANCE_DUE",
    ].includes(obj.type) &&
    ["critical", "warning", "info"].includes(obj.severity) &&
    typeof obj.acknowledged === "boolean"
  );
}

export default function isAlertArray(data: any): data is Alert[] {
  return Array.isArray(data) && data.every(isAlert);
}
