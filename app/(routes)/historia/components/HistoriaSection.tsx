// components/sections/historia/HistoriaSection.tsx
"use client";

import { motion } from "framer-motion";
import HistoriaIntro from "./HistoriaIntro";
import HistoriaTimeline from "./HistoriaTimeline";

const HistoriaSection = () => {
  return (
    <motion.section
      className="bg-[#FBE6D4]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <HistoriaIntro />
      <HistoriaTimeline />
    </motion.section>
  );
};

export default HistoriaSection;
