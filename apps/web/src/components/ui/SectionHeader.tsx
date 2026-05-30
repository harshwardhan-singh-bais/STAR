"use client";

import { motion } from "framer-motion";
import React from "react";

interface SectionHeaderProps {
  badgeIcon?: any;
  badgeText: string;
  badgeColor?: string;
  title1: string;
  title2: string;
  description: string;
  align?: "left" | "center";
}

export function SectionHeader({
  badgeIcon: Icon,
  badgeText,
  badgeColor = "#00F5FF",
  title1,
  title2,
  description,
  align = "center"
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-16 ${align === "center" ? "text-center" : "text-left"}`}
    >
      <div className={`section-eyebrow mb-6 ${align === "center" ? "mx-auto" : ""}`}>
        {Icon && <Icon className="w-3 h-3" style={{ color: badgeColor }} />}
        <span style={{ color: badgeColor }}>
          {badgeText}
        </span>
      </div>
      <h2 className="section-title mb-4">
        <span>{title1} </span>
        <span className="gradient-text">{title2}</span>
      </h2>
      <p className={`section-copy ${align === "center" ? "mx-auto" : ""}`}>
        {description}
      </p>
    </motion.div>
  );
}
