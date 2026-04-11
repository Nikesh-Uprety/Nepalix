import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className = "", hoverEffect = false }: GlassCardProps) {
  const hoverStyles = hoverEffect 
    ? "transition-all duration-300 hover:border-[#06B6D4]/50 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] hover:-translate-y-1" 
    : "";

  return (
    <motion.div 
      className={`glass rounded-2xl p-6 ${hoverStyles} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
