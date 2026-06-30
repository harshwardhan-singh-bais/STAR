"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Clock, Calendar, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const heatMapData = [
  { time: "00:00", volume: 120, alerts: 2 }, { time: "02:00", volume: 80, alerts: 1 },
  { time: "04:00", volume: 50, alerts: 0 }, { time: "06:00", volume: 190, alerts: 5 },
  { time: "08:00", volume: 450, alerts: 12 }, { time: "10:00", volume: 890, alerts: 45 },
  { time: "12:00", volume: 1100, alerts: 60 }, { time: "14:00", volume: 1250, alerts: 82 },
  { time: "16:00", volume: 980, alerts: 34 }, { time: "18:00", volume: 600, alerts: 18 },
  { time: "20:00", volume: 400, alerts: 8 }, { time: "22:00", volume: 250, alerts: 4 },
];

const burstEvents = [
  { id: "BST-891", entity: "ACC-5590", time: "14:32", volume: "$67,800", spikes: "+450%" },
  { id: "BST-892", entity: "ACC-1102", time: "14:28", volume: "$189,000", spikes: "+820%" },
  { id: "BST-893", entity: "ACC-7744", time: "14:15", volume: "$28,000", spikes: "+310%" },
];

const dormancyEvents = [
  { id: "DRM-101", entity: "ACC-4521", dormantFor: "11 mos", amount: "$234,000", risk: "Critical" },
  { id: "DRM-102", entity: "ACC-8832", dormantFor: "8 mos", amount: "$45,000", risk: "High" },
];

export default function TemporalAnalyticsPage() {
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
              <ResponsiveContainer width="100%" height="100%">
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
                  <Area yAxisId="left" type="monotone" dataKey="volume" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" name="Volume" />
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
