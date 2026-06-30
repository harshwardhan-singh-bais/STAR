"use client";

import * as React from "react";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

interface RiskRadarProps {
  data: { subject: string; A: number; fullMark: number }[];
  color?: string;
}

export function RiskRadar({ data, color = "#1A56DB" }: RiskRadarProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <div className="w-full h-full min-h-[250px]">
      {mounted && (
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 250, height: 250 }}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "#64748B", fontSize: 10 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Risk Factors"
            dataKey="A"
            stroke={color}
            fill={color}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
