"use client";
import { motion } from "framer-motion";
import { Loader, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface VerificationPanelProps {
  code: string;
  onVerified?: () => void;
}

export default function VerificationPanel({ code, onVerified }: VerificationPanelProps) {
  const [statusText, setStatusText] = useState(
    "Waiting for branch staff to confirm..."
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Simulate branch staff confirmation
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatusText("Branch staff confirmed code match");
      setIsVerifying(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVerifying) {
      const timer = setTimeout(() => {
        setIsVerified(true);
        setStatusText("Verification successful!");
        if (onVerified) {
          onVerified();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVerifying, onVerified]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center space-y-4"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Title with loading spinner */}
        <h3 className="text-2xl font-semibold text-zenith-neutral-900 flex items-center justify-center gap-2">
          <Loader className="animate-spin text-zenith-accent-600 w-8 h-8" />
          <span>Awaiting Verification</span>
        </h3>

        {/* Verification code display */}
        <p className="text-zenith-neutral-600 text-sm">Your verification code is:</p>
        <p className="text-4xl font-mono font-bold text-zenith-accent-600 tracking-widest">
          {code}
        </p>

        {/* Status text with animation */}
        <motion.div
          className="text-zenith-accent-600 text-base bg-zenith-accent-50 rounded-full px-6 py-3 inline-flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Tiny pulsing dot */}
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-zenith-accent-500"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <span className="font-medium">{statusText}</span>
        </motion.div>

        {/* Checkmark once the verification is done */}
        {isVerified && (
          <motion.div
            className="text-green-500 text-xl mt-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="inline-block w-8 h-8" />
            <p className="text-lg mt-2 font-semibold">Verification Successful!</p>
            <p className="text-sm text-gray-600 mt-1">You can now proceed with repairs</p>
          </motion.div>
        )}

        {!isVerified && !isVerifying && (
          <div className="mt-4 p-3 bg-zenith-accent-50 rounded-lg border border-zenith-accent-200">
            <p className="text-sm text-zenith-accent-700">
              Share this code with branch staff. They will confirm it matches their system.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
