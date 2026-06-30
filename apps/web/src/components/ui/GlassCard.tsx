"use client";

import { HTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface SurfaceCardProps extends HTMLMotionProps<"div"> {
  elevated?: boolean;
  noPadding?: boolean;
}

/**
 * SurfaceCard — Professional white card with subtle elevation.
 * Replaces GlassCard everywhere in the dashboard.
 */
export function SurfaceCard({
  children,
  className = "",
  elevated = false,
  noPadding = false,
  ...props
}: SurfaceCardProps) {
  const baseClass = elevated ? "surface-card-elevated" : "surface-card";

  return (
    <motion.div
      className={`${baseClass} surface-card-hover ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * GlassCard kept as alias for backward compat with landing page sections.
 * Dashboard should use SurfaceCard instead.
 */
export function GlassCard({
  children,
  className = "",
  intensity = "medium",
  hoverEffect = false,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "heavy" | "cyber";
  hoverEffect?: boolean;
  [key: string]: any;
}) {
  // In app context (light theme), render as surface card
  // In landing context, render as glass card
  return (
    <SurfaceCard className={className} {...props}>
      {children}
    </SurfaceCard>
  );
}
