"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  intensity?: "light" | "medium" | "heavy" | "cyber";
  hoverEffect?: boolean;
}

export function GlassCard({ 
  children, 
  className = "", 
  intensity = "medium", 
  hoverEffect = false,
  ...props 
}: GlassCardProps) {
  
  let baseClass = "glass";
  if (intensity === "heavy") baseClass = "glass-strong";
  if (intensity === "light") baseClass = "glass-card";
  if (intensity === "cyber") baseClass = "glass-cyber";

  const hoverClass = hoverEffect ? "hover-glow-cyan transition-all duration-200" : "";

  return (
    <motion.div 
      className={`${baseClass} ${hoverClass} rounded-xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
