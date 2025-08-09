// components/AnimatedSection.tsx
"use client";

import { motion } from "framer-motion";

type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
};

const AnimatedSection = ({
  children,
  className = "",
  direction = "up",
}: AnimatedSectionProps) => {
  const variants = {
    up: { opacity: 0, y: 100, x: 0 },
    left: { opacity: 0, y: 0, x: -100 },
    right: { opacity: 0, y: 0, x: 100 },
  };

  return (
    <motion.div
      initial={variants[direction]}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
