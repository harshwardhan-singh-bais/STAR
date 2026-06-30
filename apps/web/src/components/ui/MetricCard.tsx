"use client";

import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  icon?: any;
  /** Accent color — used for left border and icon bg */
  color?: string;
  description?: string;
}

export function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  trend,
  icon: Icon,
  color = "#1A56DB",
  description,
}: MetricCardProps) {
  const animatedValue = useAnimatedNumber(value);

  const displayValue =
    value % 1 === 0
      ? Math.floor(animatedValue).toLocaleString()
      : animatedValue.toFixed(1);

  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className="metric-card-accent"
      style={{ borderLeftColor: color }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
          )}
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#64748B" }}
          >
            {label}
          </span>
        </div>

        {/* Trend badge */}
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold"
            style={{
              background: trendPositive ? "#DCFCE7" : "#FEE2E2",
              color: trendPositive ? "#16A34A" : "#DC2626",
            }}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {trend > 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className="text-2xl font-bold"
        style={{ color: "#0F172A", fontVariantNumeric: "tabular-nums" }}
      >
        {prefix}
        {displayValue}
        {suffix}
      </div>

      {/* Optional description */}
      {description && (
        <div className="mt-1 text-xs" style={{ color: "#94A3B8" }}>
          {description}
        </div>
      )}
    </div>
  );
}
