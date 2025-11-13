import { AtmMap } from "@/components/ops/AtmMap";

export default function MapPage() {
  return (
    <div
      data-guide="atm-map"
      className="bg-white rounded-lg shadow-sm border border-zenith-neutral-200 overflow-hidden h-full"
    >
      <AtmMap />
    </div>
  );
}
