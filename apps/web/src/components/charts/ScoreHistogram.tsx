"use client";

import * as React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

interface ScoreHistogramProps {
  data: { range: string; count: number; isAnomaly: boolean }[];
  height?: number;
}

export function ScoreHistogram({ data, height = 200 }: ScoreHistogramProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <div style={{ width: "100%", height }}>
      {mounted && (
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 100, height }}>
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis 
            dataKey="range" 
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
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            itemStyle={{ fontSize: "12px", color: "#334155" }}
            labelStyle={{ color: "#64748B", marginBottom: "4px", fontWeight: 600 }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isAnomaly ? "#F43F5E" : "#3B82F6"} opacity={entry.isAnomaly ? 0.8 : 0.4} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
