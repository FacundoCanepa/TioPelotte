"use client";
import { motion } from "framer-motion";

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-[#FBE6D4] text-[#5A3E1B] text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full space-y-6"
      >
        {children}
      </motion.div>
    </div>
  );
}
