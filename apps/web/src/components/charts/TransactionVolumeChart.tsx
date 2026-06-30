"use client";

import * as React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TransactionVolumeChartProps {
  data: { time: string; volume: number; anomaly: number }[];
  height?: number;
}

export function TransactionVolumeChart({ data, height = 200 }: TransactionVolumeChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <div style={{ width: "100%", height }}>
      {mounted && (
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 100, height }}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#1A56DB" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.12}/>
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: "#94A3B8", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: "#94A3B8", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            itemStyle={{ fontSize: "12px", color: "#334155" }}
            labelStyle={{ color: "#64748B", marginBottom: "4px", fontWeight: 600 }}
          />
          <Area 
            type="monotone" 
            dataKey="volume" 
            stroke="#1A56DB" 
            strokeWidth={1.5}
            fillOpacity={1} 
            fill="url(#colorVolume)" 
          />
          <Area 
            type="monotone" 
            dataKey="anomaly" 
            stroke="#DC2626" 
            strokeWidth={1.5}
            fillOpacity={1} 
            fill="url(#colorAnomaly)" 
          />
        </AreaChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
