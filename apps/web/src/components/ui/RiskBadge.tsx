import React from "react";
import type { RiskLevel, Severity } from "@/types";

interface RiskBadgeProps {
  level: RiskLevel | Severity;
  className?: string;
  size?: "sm" | "md";
}

const RISK_STYLES: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  critical: {
    bg: "#FEE2E2",
    color: "#DC2626",
    border: "#FECACA",
    dot: "#DC2626",
  },
  high: {
    bg: "#FEF3C7",
    color: "#D97706",
    border: "#FDE68A",
    dot: "#D97706",
  },
  medium: {
    bg: "#FEFCE8",
    color: "#CA8A04",
    border: "#FEF08A",
    dot: "#CA8A04",
  },
  low: {
    bg: "#DCFCE7",
    color: "#16A34A",
    border: "#BBF7D0",
    dot: "#16A34A",
  },
};

export function RiskBadge({ level, className = "", size = "sm" }: RiskBadgeProps) {
  const key = String(level).toLowerCase();
  const styles = RISK_STYLES[key] ?? {
    bg: "#F1F5F9",
    color: "#64748B",
    border: "#E2E8F0",
    dot: "#94A3B8",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-semibold ${className}`}
      style={{
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        padding: size === "md" ? "3px 10px" : "2px 8px",
        fontSize: size === "md" ? "12px" : "11px",
        letterSpacing: "0.02em",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: styles.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {String(level).charAt(0).toUpperCase() + String(level).slice(1).toLowerCase()}
    </span>
  );
}
