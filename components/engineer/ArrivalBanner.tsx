"use client";
import { motion } from "framer-motion";
import { CheckCircle, MapPin, Compass } from "lucide-react";

export default function ArrivalBanner({
  arrived,
  distance,
}: {
  arrived: boolean;
  distance: number | null;
}) {
  return (
    <motion.div
      className={`p-4 rounded-xl text-center font-medium shadow-lg w-full max-w-md mx-auto ${
        arrived 
          ? "bg-green-100 text-green-700 border border-green-200" 
          : "bg-zenith-accent-50 text-zenith-accent-700 border border-zenith-accent-200"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-center items-center gap-3 animate-pulse">
        {/* Conditional icons */}
        {arrived ? (
          <CheckCircle className="w-6 h-6 text-green-600 animate-bounce" />
        ) : distance ? (
          <MapPin className="w-6 h-6 text-blue-600 animate-pulse" />
        ) : (
          <Compass className="w-6 h-6 text-gray-600 animate-spin" />
        )}

        <div>
          {/* Conditional Text */}
          {arrived ? (
            <p className="text-lg font-semibold">
              You&apos;ve arrived at the ATM
            </p>
          ) : distance ? (
            <p className="text-lg font-semibold">
              {/* En route – {Math.round(distance)}m to go */}
              Waiting for you to arrive at the ATM
            </p>
          ) : (
            <p className="text-lg font-semibold">
              Determining your location...
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
