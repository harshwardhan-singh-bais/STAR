"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  icon?: any;
  children: React.ReactNode;
  showArrow?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * ActionButton — Professional solid buttons replacing NeonButton.
 * Variants: primary (blue), secondary (outlined), danger (red), ghost (text).
 * NeonButton exported as alias for backward compatibility with landing page.
 */
export function ActionButton({
  variant = "primary",
  icon: Icon,
  children,
  showArrow = false,
  size = "md",
  className = "",
  ...props
}: ActionButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-2.5 text-sm gap-2",
  }[size];

  const baseClass = `inline-flex items-center justify-center rounded-md font-medium transition-all cursor-pointer ${sizeClasses} ${className}`;

  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "#1A56DB", color: "#FFFFFF", border: "none" },
    secondary: { background: "#FFFFFF", color: "#334155", border: "1px solid #CBD5E1" },
    danger: { background: "#DC2626", color: "#FFFFFF", border: "none" },
    ghost: { background: "transparent", color: "#64748B", border: "none" },
    outline: { background: "transparent", color: "#1A56DB", border: "1px solid #1A56DB" },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: { background: "#1648C4" },
    secondary: { background: "#F8FAFC", borderColor: "#CBD5E1" },
    danger: { background: "#B91C1C" },
    ghost: { background: "#F4F6F9", color: "#334155" },
    outline: { background: "#EFF6FF" },
  };

  return (
    <button
      className={baseClass}
      style={styles[variant]}
      onMouseEnter={e => {
        Object.assign((e.currentTarget as HTMLElement).style, hoverStyles[variant]);
      }}
      onMouseLeave={e => {
        Object.assign((e.currentTarget as HTMLElement).style, styles[variant]);
      }}
      {...props}
    >
      {Icon && <Icon style={{ width: size === "sm" ? "14px" : "16px", height: size === "sm" ? "14px" : "16px" }} />}
      <span>{children}</span>
      {showArrow && <ArrowRight style={{ width: "14px", height: "14px" }} />}
    </button>
  );
}

/**
 * NeonButton — kept as alias so landing page imports don't break.
 * On the landing page, neon button styles are preserved via inline styles.
 */
export function NeonButton({
  variant = "primary",
  icon: Icon,
  children,
  showArrow = false,
  className = "",
  ...props
}: ActionButtonProps) {
  // Landing page variant — preserve the original neon look
  if (variant === "primary") {
    return (
      <button
        className={`group relative inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300 ${className}`}
        style={{
          background: "linear-gradient(135deg, #00F5FF, #3B82F6, #A855F7)",
          color: "#020617",
        }}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4 relative z-10" />}
        <span className="relative z-10">{children}</span>
        {showArrow && <ArrowRight className="w-4 h-4 relative z-10" />}
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        className={`group inline-flex items-center gap-2 px-8 py-3 rounded-xl border font-medium text-sm transition-all duration-300 ${className}`}
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.08)",
          color: "#E2E8F0",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.3)";
          (e.currentTarget as HTMLElement).style.background = "rgba(0,245,255,0.05)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        }}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
        {showArrow && <ArrowRight className="w-4 h-4 text-[#00F5FF]" />}
      </button>
    );
  }

  return <ActionButton variant={variant} icon={Icon} showArrow={showArrow} className={className} {...props}>{children}</ActionButton>;
}
