"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { TransactionVolumeChart } from "@/components/charts/TransactionVolumeChart";
import { RiskRadar } from "@/components/charts/RiskRadar";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { STAGGER_CONTAINER, STAGGER_ITEM_UP } from "@/animations/variants";
import { useAMLStore } from "@/store/useAMLStore";
import { Activity, ShieldAlert, Crosshair, Network, BarChart2 } from "lucide-react";
import { getRiskColor } from "@/utils/format";

export default function CommandCenterSection() {
  const { ref, isInView } = useScrollReveal();
  const { alerts } = useAMLStore();

  const mockVolumeData = [
    { time: "00:00", volume: 1200, anomaly: 0 },
    { time: "04:00", volume: 900, anomaly: 200 },
    { time: "08:00", volume: 3400, anomaly: 0 },
    { time: "12:00", volume: 5600, anomaly: 400 },
    { time: "16:00", volume: 4800, anomaly: 1200 },
    { time: "20:00", volume: 2100, anomaly: 100 },
    { time: "24:00", volume: 1500, anomaly: 0 },
  ];

  const mockRadarData = [
    { subject: "Velocity", A: 85, fullMark: 100 },
    { subject: "Structuring", A: 65, fullMark: 100 },
    { subject: "Network Centrality", A: 92, fullMark: 100 },
    { subject: "Jurisdiction", A: 70, fullMark: 100 },
    { subject: "Mule Pattern", A: 45, fullMark: 100 },
    { subject: "Dormancy", A: 88, fullMark: 100 },
  ];

  return (
    <section id="command-center" className="relative py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
      <div className="container mx-auto px-6 lg:px-12 relative z-10" ref={ref}>
        <SectionHeader
          badgeIcon={Activity}
          badgeText="COMMAND CENTER"
          badgeColor="#1E40AF"
          title1="Real-time"
          title2="Intelligence Dashboard."
          description="A unified, single-pane-of-glass view of your institution's risk landscape. Monitor alerts, analyze transaction volumes, and track ML pipeline performance instantly."
        />

        <motion.div
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
        >
          {/* Top Metrics Row */}
          <motion.div variants={STAGGER_ITEM_UP}>
            <MetricCard label="Active Alerts" value={142} trend={12} icon={ShieldAlert} color="#DC2626" />
          </motion.div>
          <motion.div variants={STAGGER_ITEM_UP}>
            <MetricCard label="Transactions Analyzed" value={2.7} suffix="M" trend={5} icon={Activity} color="#2563EB" />
          </motion.div>
          <motion.div variants={STAGGER_ITEM_UP}>
            <MetricCard label="Graph Nodes" value={1.2} suffix="M" trend={8} icon={Network} color="#4F46E5" />
          </motion.div>
          <motion.div variants={STAGGER_ITEM_UP}>
            <MetricCard label="Avg Scoring Latency" value={47} suffix="ms" trend={-15} icon={Crosshair} color="#059669" />
          </motion.div>

          {/* Main Dashboard Area */}
          <motion.div variants={STAGGER_ITEM_UP} className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            
            {/* Chart 1: Volume */}
            <GlassCard className="col-span-1 md:col-span-2 p-6 h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#1E40AF]" />
                  <h3 className="font-bold text-[#0F172A] text-sm">24h Transaction Volume vs Anomalies</h3>
                </div>
                <div className="flex gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1 text-[#1E40AF]"><div className="w-2 h-2 rounded-full bg-[#1E40AF]"/> Baseline</div>
                  <div className="flex items-center gap-1 text-[#DC2626]"><div className="w-2 h-2 rounded-full bg-[#DC2626]"/> Anomalous</div>
                </div>
              </div>
              <div className="flex-1 -ml-4">
                <TransactionVolumeChart data={mockVolumeData} height={200} />
              </div>
            </GlassCard>

            {/* Live Feed List */}
            <GlassCard className="p-4 h-[350px] overflow-hidden flex flex-col">
              <h3 className="font-bold text-[#0F172A] text-sm mb-4 px-2">Live Alert Stream</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors flex items-start gap-3">
                    <div className="w-1.5 h-full min-h-[40px] rounded-full" style={{ backgroundColor: getRiskColor(alert.severity) }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-[#0F172A] truncate max-w-[150px]">{alert.type.replace(/_/g, ' ').toUpperCase()}</span>
                        <span className="text-[10px] text-[#64748B] font-mono">{alert.time}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-[#64748B] font-mono">{alert.entityCount} entities</span>
                        <span className="text-xs font-mono" style={{ color: getRiskColor(alert.severity) }}>{alert.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Radar Chart */}
            <GlassCard className="p-4 h-[350px] flex flex-col items-center">
              <h3 className="font-bold text-[#0F172A] text-sm mb-2 self-start px-2">Aggregate Risk Vector</h3>
              <div className="flex-1 w-full max-w-[300px]">
                <RiskRadar data={mockRadarData} color="#4F46E5" />
              </div>
            </GlassCard>

          </motion.div>

          {/* Right Sidebar: Quick Actions & Status */}
          <motion.div variants={STAGGER_ITEM_UP} className="col-span-1 flex flex-col gap-4 mt-4">
            <GlassCard className="p-5 flex-1 border-t-2 border-t-[#1E40AF]">
              <h3 className="font-bold text-[#0F172A] text-sm mb-4">System Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#64748B]">Isolation Forest Pipeline</span>
                    <span className="text-[#059669] font-mono">ONLINE</span>
                  </div>
                  <div className="h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#059669] w-[100%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#64748B]">GraphSAGE Engine</span>
                    <span className="text-[#059669] font-mono">ONLINE</span>
                  </div>
                  <div className="h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#059669] w-[100%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#64748B]">Data Ingestion Load</span>
                    <span className="text-[#D97706] font-mono">78%</span>
                  </div>
                  <div className="h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D97706] w-[78%]" />
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-[#0F172A] text-sm mt-8 mb-4">Command Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors text-xs text-[#0F172A] font-medium">
                  Generate Daily Briefing
                </button>
                <button className="w-full text-left px-4 py-2 rounded border border-[#DC2626]/20 text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors text-xs font-medium">
                  Halt All High-Risk Txns
                </button>
                <button className="w-full text-left px-4 py-2 rounded border border-[#4F46E5]/20 text-[#4F46E5] hover:bg-[#4F46E5]/10 transition-colors text-xs font-medium">
                  Re-train ML Baseline
                </button>
              </div>
            </GlassCard>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
