"use client";

import { AICopilot } from "@/features/investigation/AICopilot";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bot, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { useInvestigationStore } from "@/store/useInvestigationStore";
import { motion, AnimatePresence } from "framer-motion";

export default function CopilotPage() {
  const { activeSarDraft, isGeneratingSar } = useInvestigationStore();

  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bot className="w-5 h-5" style={{ color: "#7C3AED" }} />
            AI Investigation Copilot
          </h1>
          <p className="page-subtitle">Natural Language to Cypher and automated SAR generation.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Chat Interface */}
        <div className="col-span-1 lg:col-span-8 flex flex-col">
          <AICopilot />
        </div>

        {/* Right: SAR Generation Workspace */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <GlassCard className="flex-1 p-6 relative overflow-hidden group flex flex-col bg-white border border-[#E2E8F0] shadow-sm rounded-2xl" style={{ borderTop: "4px solid #10B981" }}>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 rounded" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <FileText className="w-4 h-4" style={{ color: "#10B981" }} />
              </div>
              <h3 className="font-bold text-[#0F172A]">Auto-SAR Workspace</h3>
            </div>

            <div className="relative flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {isGeneratingSar ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-12 h-12 relative mb-4">
                      <div className="absolute inset-0 border-2 border-[#E2E8F0] rounded-full" />
                      <div className="absolute inset-0 border-2 rounded-full border-t-transparent animate-spin" style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }} />
                      <Bot className="absolute inset-0 m-auto w-5 h-5 animate-pulse" style={{ color: "#7C3AED" }} />
                    </div>
                    <h4 className="text-[#334155] font-bold mb-2">Synthesizing Report</h4>
                    <p className="text-[#64748B] text-sm font-mono max-w-[250px]">
                      Compiling graph trajectories, ML scores, and transaction history...
                    </p>
                  </motion.div>
                ) : activeSarDraft ? (
                  <motion.div
                    key="draft"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-4 text-[#10B981] text-xs font-mono px-3 py-1.5 rounded w-fit" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      DRAFT GENERATED
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex-1 overflow-y-auto scrollbar-hide text-sm">
                      <div className="font-mono mb-3 text-xs" style={{ color: "#2563EB" }}>
                        REPORT_ID: {activeSarDraft.id}<br/>
                        TIMESTAMP: {activeSarDraft.createdAt}
                      </div>
                      <h4 className="font-bold text-[#0F172A] mb-2">{activeSarDraft.subject}</h4>
                      <div className="space-y-4 text-[#475569] leading-relaxed">
                        {activeSarDraft.narrative.split('\n\n').map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button className="flex-1 bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0] rounded-lg py-2.5 text-sm font-medium transition-colors">
                        Edit Draft
                      </button>
                      <button className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <ShieldCheck className="w-4 h-4" />
                        File to FinCEN
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-60"
                  >
                    <FileText className="w-12 h-12 text-[#94A3B8] mb-4" />
                    <p className="text-[#64748B] text-sm px-4">
                      Ask the Copilot to generate a SAR draft based on the current investigation context.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
