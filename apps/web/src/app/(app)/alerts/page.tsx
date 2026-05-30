"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAMLStore } from "@/store/useAMLStore";
import { starApi } from "@/lib/api";
import { ShieldAlert, Filter, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { formatCurrency, getRiskColor, getRiskBgColor } from "@/utils/format";
import { STAGGER_CONTAINER, STAGGER_ITEM_UP } from "@/animations/variants";
import { RiskBadge } from "@/components/ui/RiskBadge";

export default function AlertsPage() {
  const { alerts, setAlerts } = useAMLStore();

  useEffect(() => {
    starApi.getAlerts().then(data => setAlerts(data as any)).catch(console.error);
  }, [setAlerts]);

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-[#F43F5E]" />
            Alert Center
          </h1>
          <p className="text-[#475569]">Manage and prioritize active AML investigations.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors text-sm text-[#0F172A]">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-[#F43F5E] hover:bg-[#F43F5E]/20 transition-colors text-sm font-bold">
            Auto-Triage Active
          </button>
        </div>
      </div>

      <GlassCard className="surface-card overflow-hidden border border-[#E2E8F0]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-mono text-[#475569] uppercase tracking-wider">
                <th className="p-4 font-medium flex items-center gap-1 cursor-pointer hover:text-[#0F172A]">ID <ArrowUpDown className="w-3 h-3"/></th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Amount at Risk</th>
                <th className="p-4 font-medium text-right">Time</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <motion.tbody variants={STAGGER_CONTAINER} initial="hidden" animate="visible">
              {alerts.map((alert) => (
                <motion.tr 
                  variants={STAGGER_ITEM_UP}
                  key={alert.id} 
                  className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                >
                    <td className="p-4 text-xs font-mono text-[#0F172A]">{alert.id}</td>
                    <td className="p-4 text-sm text-[#475569]">{alert.type.replace(/_/g, ' ')}</td>
                  <td className="p-4">
                    <RiskBadge level={alert.severity} />
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-mono px-2 py-1 rounded-md ${
                      alert.status === 'open' ? 'bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/20' :
                      alert.status === 'investigating' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' :
                      'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                    }`}>
                      {alert.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-[#0F172A]">
                    {alert.amount}
                  </td>
                  <td className="p-4 text-right text-xs font-mono text-[#475569]">
                    {alert.time}
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-[#475569] hover:text-[#0F172A] transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
