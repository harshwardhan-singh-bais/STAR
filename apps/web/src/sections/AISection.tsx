"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { AICopilot } from "@/features/investigation/AICopilot";
import { useInvestigationStore } from "@/store/useInvestigationStore";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { STAGGER_CONTAINER, STAGGER_ITEM_UP } from "@/animations/variants";
import { Bot, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AISection() {
  const { activeSarDraft, isGeneratingSar } = useInvestigationStore();
  const { ref, isInView } = useScrollReveal();

  return (
    <section id="ai-copilot" className="relative py-20 bg-[#F8FAFC] border-t border-[#E2E8F0] overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10" ref={ref}>
        <SectionHeader
          badgeIcon={Bot}
          badgeText="INVESTIGATION COPILOT"
          badgeColor="#4F46E5"
          title1="Conversational"
          title2="Intelligence."
          description="Investigate complex networks, translate natural language to Cypher graph queries, and automatically generate Suspicious Activity Reports (SAR) in seconds."
        />

        <motion.div
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16"
        >
          {/* Left Column: AI Copilot Chat */}
          <motion.div variants={STAGGER_ITEM_UP} className="lg:col-span-7 h-[700px]">
            <AICopilot />
          </motion.div>

          {/* Right Column: SAR Generation & Workspace */}
          <motion.div variants={STAGGER_ITEM_UP} className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Context Panel */}
            <GlassCard intensity="light" className="p-6 border-[#E2E8F0] border-l-2 border-l-[#4F46E5]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#4F46E5]/10 rounded border border-[#4F46E5]/20">
                  <AlertTriangle className="w-4 h-4 text-[#4F46E5]" />
                </div>
                <h3 className="text-[#0F172A] font-bold">Active Context</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B]">Primary Entity:</span>
                  <span className="font-mono text-[#1E40AF]">ACC-4521</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B]">Pattern:</span>
                  <span className="text-[#0F172A]">Circular Laundering</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B]">Graph Hops:</span>
                  <span className="text-[#0F172A]">4 Degrees</span>
                </div>
                <div className="w-full h-px bg-[#E2E8F0] my-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B]">ML Risk Score:</span>
                  <span className="font-mono font-bold text-[#DC2626]">94/100 (CRITICAL)</span>
                </div>
              </div>
            </GlassCard>

            {/* SAR Generator Panel */}
            <GlassCard intensity="light" className="flex-1 p-6 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-[#059669]/10 rounded border border-[#059669]/20">
                  <FileText className="w-4 h-4 text-[#059669]" />
                </div>
                <h3 className="text-[#0F172A] font-bold">Auto-SAR Generator</h3>
              </div>

              <div className="relative h-full min-h-[300px]">
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
                        <div className="absolute inset-0 border-2 border-[#4F46E5]/20 rounded-full" />
                        <div className="absolute inset-0 border-2 border-[#4F46E5] rounded-full border-t-transparent animate-spin" />
                        <Bot className="absolute inset-0 m-auto w-5 h-5 text-[#4F46E5] animate-pulse" />
                      </div>
                      <h4 className="text-[#0F172A] font-bold mb-2">Synthesizing Report</h4>
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
                      <div className="flex items-center gap-2 mb-4 text-[#059669] text-xs font-mono bg-[#059669]/10 px-3 py-1.5 rounded w-fit border border-[#059669]/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        DRAFT GENERATED
                      </div>
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex-1 overflow-y-auto scrollbar-hide text-sm">
                        <div className="font-mono text-[#1E40AF] mb-3 text-xs">
                          REPORT_ID: {activeSarDraft.id}<br/>
                          TIMESTAMP: {activeSarDraft.createdAt}
                        </div>
                        <h4 className="font-bold text-[#0F172A] mb-2">{activeSarDraft.subject}</h4>
                        <div className="space-y-4 text-[#64748B] leading-relaxed">
                          {activeSarDraft.narrative.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button className="flex-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#E2E8F0] rounded-lg py-2.5 text-sm font-medium transition-colors">
                          Edit Draft
                        </button>
                        <button className="flex-1 bg-[#4F46E5]/10 hover:bg-[#4F46E5]/20 text-[#4F46E5] border border-[#4F46E5]/30 rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2">
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
                      className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-50"
                    >
                      <FileText className="w-12 h-12 text-[#94A3B8] mb-4" />
                      <p className="text-[#64748B] text-sm">
                        Ask the Copilot to generate a SAR draft based on the current investigation context.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
            
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
