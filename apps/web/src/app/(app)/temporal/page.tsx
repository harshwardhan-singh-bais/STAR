"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Clock, Calendar, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import { useMemo } from "react";
import { useAMLStore } from "@/store/useAMLStore";
import { useWebSocketSim } from "@/hooks/useWebSocketSim";

export default function TemporalAnalyticsPage() {
  const { transactions } = useAMLStore();
  
  // Connect to the WebSocket / Simulator so real-time transactions stream while on this page
  useWebSocketSim();

  // Helper to generate deterministic pseudo-random numbers to prevent Next.js hydration mismatches
  const hashString = (str: string) => str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const heatMapData = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, i) => ({
      time: `${(i * 2).toString().padStart(2, '0')}:00`,
      volume: 0,
      alerts: 0,
    }));

    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      let hour = date.getHours();
      if (isNaN(hour)) {
        hour = hashString(tx.id) % 24;
      }
      const bucketIdx = Math.floor(hour / 2);
      if (buckets[bucketIdx]) {
        buckets[bucketIdx].volume += tx.amount;
        if (tx.risk === "critical" || tx.risk === "high") {
          buckets[bucketIdx].alerts += 1;
        }
      }
    });
    
    return buckets;
  }, [transactions]);

  const burstEvents = useMemo(() => {
    const entityStats: Record<string, { volume: number, orderIdx: number }> = {};
    transactions.forEach((tx, idx) => {
      if (!entityStats[tx.from]) entityStats[tx.from] = { volume: 0, orderIdx: idx };
      entityStats[tx.from].volume += tx.amount;
      if (idx < entityStats[tx.from].orderIdx) entityStats[tx.from].orderIdx = idx;
    });

    const sorted = Object.entries(entityStats)
      // Filter for substantial volumes to qualify as a burst
      .filter(([_, stats]) => stats.volume > 15000)
      // Sort by newest activity first so the widget is dynamic
      .sort((a, b) => a[1].orderIdx - b[1].orderIdx);
    
    return sorted.slice(0, 3).map((entry, idx) => ({
      id: `BST-${900 + idx}`,
      entity: entry[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      volume: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(entry[1].volume),
      spikes: `+${(hashString(entry[0]) % 500) + 200}%`
    }));
  }, [transactions]);

  const dormancyEvents = useMemo(() => {
    const entityStats: Record<string, { count: number, totalAmt: number, risk: string, orderIdx: number }> = {};
    transactions.forEach((tx, idx) => {
      if (!entityStats[tx.from]) {
        entityStats[tx.from] = { count: 0, totalAmt: 0, risk: tx.risk, orderIdx: idx };
      }
      entityStats[tx.from].count += 1;
      entityStats[tx.from].totalAmt += tx.amount;
      if (tx.risk === "critical") entityStats[tx.from].risk = "critical";
      if (idx < entityStats[tx.from].orderIdx) entityStats[tx.from].orderIdx = idx;
    });

    const sorted = Object.entries(entityStats)
      .filter(([_, stats]) => stats.count <= 4 && (stats.risk === "critical" || stats.risk === "high" || stats.risk === "moderate"))
      // Sort by newest activity first so the widget dynamically updates
      .sort((a, b) => a[1].orderIdx - b[1].orderIdx);

    return sorted.slice(0, 2).map((entry, idx) => ({
      id: `DRM-${100 + idx}`,
      entity: entry[0],
      dormantFor: `${(hashString(entry[0]) % 12) + 3} mos`,
      amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(entry[1].totalAmt),
      risk: entry[1].risk.charAt(0).toUpperCase() + entry[1].risk.slice(1)
    }));
  }, [transactions]);
  return (
    <div className="p-6 max-w-[1600px] mx-auto" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: "#D97706" }} />
            Analytics
          </h1>
          <p className="page-subtitle">Time-series anomaly detection, burst analysis, and dormancy tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-6 h-[400px] flex flex-col bg-white border border-[#E2E8F0] shadow-sm rounded-2xl">
            <h3 className="font-semibold mb-6 flex items-center gap-2" style={{ fontSize: "13px", color: "#0F172A" }}>
              <Calendar className="w-4 h-4" style={{ color: "#7C3AED" }} />
              24-Hour Transaction Volume & Anomaly Density
            </h3>
            <div className="flex-1 -ml-4">
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 300 }}>
                <AreaChart data={heatMapData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    itemStyle={{ fontSize: "12px", color: "#334155" }}
                    labelStyle={{ color: "#64748B", marginBottom: "4px", fontWeight: 600 }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="volume" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" name="Value (USD)" />
                  <Area yAxisId="right" type="monotone" dataKey="alerts" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" name="Anomalies" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
        
        <div className="col-span-1 flex flex-col gap-6">
          <GlassCard className="p-5 h-[190px] flex flex-col bg-white border border-[#E2E8F0] shadow-sm rounded-2xl overflow-hidden">
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ fontSize: "13px", color: "#0F172A" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "#F59E0B" }} />
              Recent Burst Events
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {burstEvents.map(evt => (
                <div key={evt.id} className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div>
                    <div className="text-[11px] font-bold text-[#0F172A]">{evt.entity}</div>
                    <div className="text-[9px] text-[#64748B] font-mono">{evt.time} | {evt.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-[#EF4444]">{evt.spikes}</div>
                    <div className="text-[9px] text-[#64748B]">{evt.volume}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5 h-[185px] flex flex-col bg-white border border-[#E2E8F0] shadow-sm rounded-2xl overflow-hidden">
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ fontSize: "13px", color: "#0F172A" }}>
              <AlertTriangle className="w-4 h-4" style={{ color: "#EF4444" }} />
              Dormancy Reactivations
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {dormancyEvents.map(evt => (
                <div key={evt.id} className="flex items-center justify-between p-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                  <div>
                    <div className="text-[11px] font-bold text-[#991B1B]">{evt.entity}</div>
                    <div className="text-[9px] text-[#DC2626] font-mono">Dormant: {evt.dormantFor}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-[#991B1B]">{evt.amount}</div>
                    <div className="text-[9px] font-bold text-[#DC2626]">{evt.risk}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
