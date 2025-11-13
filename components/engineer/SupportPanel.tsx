"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Phone, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

export default function SupportPanel() {
  function handleBot() {
    toast.info("Connecting you to Zenith Support Bot...");
    setTimeout(() => {
      toast.success("Bot connected! Ask your question below.");
    }, 1000);
  }

  function handleCall() {
    window.open("tel:+234700ZENITH");
    toast("Dialing Operations Manager...");
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white shadow-md rounded-xl p-5 border border-gray-100 w-full max-w-xl mx-auto mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <LifeBuoy className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-800">
          Need Assistance?
        </h3>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Get quick help from our AI Support Bot or call the Operations Manager
        for immediate assistance.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ backgroundColor: "#eef2ff" }}
          onClick={handleBot}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-50 text-indigo-700 font-medium shadow-sm border border-indigo-100 transition-all"
        >
          <Bot className="w-5 h-5" />
          Ask Support Bot
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ backgroundColor: "#f1f5f9" }}
          onClick={handleCall}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 font-medium shadow-sm border border-gray-200 transition-all"
        >
          <Phone className="w-5 h-5" />
          Call Ops Manager
        </motion.button>
      </div>
    </motion.section>
  );
}
