import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

type CheckList = {
  id: string;
  label: string;
  done: boolean;
}[];

export default function Checklist({
  checklist,
  setChecklist,
}: {
  checklist: CheckList;
  setChecklist: (checklist: CheckList) => void;
}) {
  const handleToggle = (id: string) => {
    // @ts-expect-error ignore
    setChecklist((prev: CheckList) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="font-semibold text-xl mb-4">Task Checklist</h3>
      <motion.ul
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delayChildren: 0.2, staggerChildren: 0.3 }}
      >
        {checklist.map((item) => (
          <motion.li
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`flex justify-between border items-center p-3 rounded-lg ${
              item.done
                ? "bg-zenith-accent-100 text-zenith-accent-600 border-zenith-accent-400"
                : "bg-yellow-50 text-yellow-600 border-yellow-400"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <motion.div
                className="flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
              >
                {item.done ? (
                  <CheckCircle className="text-zenith-accent-600" size={20} />
                ) : (
                  <Circle className="text-shadow-zenith-warning" size={20} />
                )}
              </motion.div>
              <span
                className={`text-lg ${
                  item.done
                    ? "line-through text-gray-400"
                    : "text-zenith-accent-700"
                }`}
              >
                {item.label}
              </span>
            </label>

            <motion.span
              className={`text-xs ${
                item.done ? "text-zenith-accent-600" : "text-zenith-warning"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {item.done ? "Done" : "Pending"}
            </motion.span>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
