"use client";

import { useReducedMotion, motion } from "framer-motion";

interface FadeInOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function FadeInOnScroll({
  children,
  className,
  delay = 0,
}: FadeInOnScrollProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
