"use client";

import { ArrowRight } from "lucide-react";
import React from "react";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  showArrow?: boolean;
}

export function NeonButton({
  variant = "primary",
  icon: Icon,
  children,
  showArrow = false,
  className = "",
  ...props
}: NeonButtonProps) {
  
  if (variant === "primary") {
    return (
      <button
        className={`group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${className}`}
        style={{
          background: "linear-gradient(135deg, #1E40AF, #2563EB)",
          color: "#FFFFFF",
        }}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4 relative z-10" />}
        <span className="relative z-10">{children}</span>
        {showArrow && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />}
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        className={`group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border font-medium text-sm transition-all duration-200 ${className}`}
        style={{
          background: "#FFFFFF",
          borderColor: "#E2E8F0",
          color: "#0F172A",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "#1E40AF";
          (e.currentTarget as HTMLElement).style.background = "#F8FAFC";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
          (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
        }}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
        {showArrow && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#1E40AF]" />}
      </button>
    );
  }

  // secondary
  return (
    <button
      className={`group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border font-medium text-sm transition-all duration-200 ${className}`}
      style={{
        background: "#F8FAFC",
        borderColor: "#E2E8F0",
        color: "#4F46E5",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "#F1F5F9";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "#F8FAFC";
      }}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
}
