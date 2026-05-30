"use client";

import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color?: string;
}

export function MetricCard({ 
  label, 
  value, 
  prefix = "", 
  suffix = "", 
  trend,
  icon: Icon,
  color = "#1E40AF"
}: MetricCardProps) {
  
  const animatedValue = useAnimatedNumber(value);

  // Formatting for decimals vs integers
  const displayValue = value % 1 === 0 
    ? Math.floor(animatedValue).toLocaleString()
    : animatedValue.toFixed(1);

  return (
    <div 
      className="surface-card rounded-xl p-4 transition-all duration-200 hover-glow-cyan"
      style={{ border: `1px solid ${color}20` }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}20`;
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
        )}
        <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold font-mono text-[#0F172A]">
          {prefix}{displayValue}{suffix}
        </div>
        
        {trend !== undefined && (
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${trend >= 0 ? "text-[#059669] bg-[#059669]/10" : "text-[#DC2626] bg-[#DC2626]/10"}`}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}
