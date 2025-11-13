"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, CircleDot, Loader2 } from "lucide-react";

const steps = ["Verify", "Connect", "Monitor"];

export default function IADStepProgress({ step }: { step: number }) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-4 py-4 px-2 w-full">
      {steps.map((label, i) => {
        const active = i === step;
        const done = i < step;
        const Icon = done ? Check : active ? Loader2 : CircleDot;

        return (
          <React.Fragment key={label}>
            <motion.div
              className="flex flex-col items-center relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                className={`flex items-center justify-center rounded-full w-10 h-10 
                  ${
                    done
                      ? "bg-green-600 text-white"
                      : active
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                whileHover={{ scale: active ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon
                  size={20}
                  className={`${active ? "animate-spin-slow" : ""}`}
                />
              </motion.div>
              <motion.span
                className={`text-xs mt-2 text-center ${
                  active
                    ? "font-semibold text-indigo-700"
                    : done
                    ? "text-green-700"
                    : "text-gray-500"
                }`}
              >
                {label}
              </motion.span>
            </motion.div>

            {i < steps.length - 1 && (
              <motion.div
                className="w-10 h-1 rounded-full bg-gray-300 md:w-14"
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: done ? 1 : active ? 0.5 : 0.2,
                  backgroundColor: done
                    ? "#16a34a"
                    : active
                    ? "#4f46e5"
                    : "#d1d5db",
                }}
                transition={{ duration: 0.4 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
