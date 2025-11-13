// components/Header.tsx
"use client";

/**
 * Global Header used across pages
 */

import { motion } from "framer-motion";

export default function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.header
      className="bg-white border-b"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="text-sm text-slate-400 flex items-center gap-1">
          ATM360 •{" "}
          <img src="/images/zeni.png" className="w-6 h-6 animate-spin" />
        </div>
      </div>
    </motion.header>
  );
}
