import { motion, type Variants } from "framer-motion";
import {
  Wrench,
  ShieldAlert,
  Building,
  MapPin,
  HardDrive,
  Banknote,
  CalendarClock,
  Activity,
  type LucideIcon, // ✅ correct import for Lucide types
} from "lucide-react";

// --- Example types (replace with real ones if you have them) ---
// type Ticket = {
//   status:
//     | "OPEN"
//     | "ASSIGNED"
//     | "IN_PROGRESS"
//     | "RESOLVED"
//     | "ESCALATED"
//     | "CLOSED";
//   issueType: string;
//   severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
// };

// type ATM = {
//   model: string;
//   type: string;
//   updatedAt: string;
//   location: {
//     branchName: string;
//     address: string;
//   };
// };

// --- Component Props ---
type TaskSummaryCardProps = {
  ticket: Ticket;
  atm: ATM;
};

// --- Status Badge Helper ---
const statusStyles: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800 border-indigo-200",
  RESOLVED: "bg-green-100 text-green-800 border-green-200",
  ESCALATED: "bg-red-100 text-red-800 border-red-200",
  CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
};

// --- Framer Motion Variants ---
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// --- Date Formatter ---
const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

// --- Main Component ---
export default function TaskSummaryCard({ ticket, atm }: TaskSummaryCardProps) {
  const statusClassName =
    statusStyles[ticket.status] ?? "bg-gray-100 text-gray-800 border-gray-200";

  const severityColor =
    ticket.severity === "HIGH" || ticket.severity === "CRITICAL"
      ? "text-red-600"
      : "text-gray-800";

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 w-full max-w-md mx-auto h-fit"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center pb-4 border-b border-gray-100"
        variants={itemVariants}
      >
        <h3 className="font-bold text-xl text-gray-900">Task Summary</h3>
        <span
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${statusClassName}`}
        >
          <Activity size={14} aria-hidden="true" />
          {ticket.status}
        </span>
      </motion.div>

      {/* Info List */}
      <motion.div
        className="divide-y divide-gray-100 pt-4"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        {/* Group 1 */}
        <div className="py-4 space-y-4">
          <InfoRow icon={Wrench} label="Issue Type" value={ticket.issueType} />
          <InfoRow
            icon={ShieldAlert}
            label="Severity"
            value={ticket.severity}
            valueColor={severityColor}
          />
        </div>

        {/* Group 2 */}
        <div className="py-4 space-y-4">
          <InfoRow
            icon={Building}
            label="Branch Location"
            value={atm.location.branchName!}
          />
          <InfoRow icon={MapPin} label="Address" value={atm.location.address} />
        </div>

        {/* Group 3 */}
        <div className="py-4 space-y-4">
          <InfoRow icon={HardDrive} label="ATM Model" value={atm.model} />
          <InfoRow icon={Banknote} label="ATM Type" value={atm.type} />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100 flex items-center gap-2"
        variants={itemVariants}
      >
        <CalendarClock size={14} aria-hidden="true" />
        <span>
          Last updated: {dateTimeFormatter.format(new Date(atm.updatedAt))}
        </span>
      </motion.div>
    </motion.div>
  );
}

// --- Info Row ---
type InfoRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  valueColor?: string;
};

function InfoRow({
  icon: Icon,
  label,
  value,
  valueColor = "text-gray-800",
}: InfoRowProps) {
  return (
    <motion.div className="flex items-start gap-3" variants={itemVariants}>
      <Icon
        className="text-zenith-accent-600 mt-0.5 flex-shrink-0"
        size={18}
        aria-hidden="true"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <p className={`text-base font-semibold ${valueColor}`}>{value}</p>
      </div>
    </motion.div>
  );
}
