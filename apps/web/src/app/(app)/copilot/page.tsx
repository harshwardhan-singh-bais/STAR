"use client";
import { useState } from "react";

import { AICopilot } from "@/features/investigation/AICopilot";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bot, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { useInvestigationStore } from "@/store/useInvestigationStore";
import { motion, AnimatePresence } from "framer-motion";

export default function CopilotPage() {
  const { activeSarDraft, isGeneratingSar, setActiveSar } = useInvestigationStore();
  const [isFiling, setIsFiling] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedNarrative, setEditedNarrative] = useState("");

  const handleFileToFincen = () => {
    setIsFiling(true);
    setTimeout(() => {
      setIsFiling(false);
      if (activeSarDraft) {
        setActiveSar({ ...activeSarDraft, status: "filed" });
      }
      setToastMessage("Filing submitted securely to FinCEN via batch API.");
      setTimeout(() => setToastMessage(""), 4000);
    }, 1500);
  };

  const handleEditDraft = () => {
    if (activeSarDraft) {
      setEditedNarrative(activeSarDraft.narrative);
      setIsEditing(true);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-56px)] overflow-hidden" style={{ background: "#F4F6F9" }}>
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bot className="w-5 h-5" style={{ color: "#7C3AED" }} />
            AI Investigation Copilot
          </h1>
          <p className="page-subtitle">Natural Language to Cypher and automated SAR generation.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left: Chat Interface */}
        <div className="col-span-1 lg:col-span-8 flex flex-col h-full overflow-hidden">
          <AICopilot />
        </div>

        {/* Right: SAR Workspace */}
        <div className="col-span-1 lg:col-span-4 flex flex-col h-full overflow-hidden">
          <GlassCard className="flex-1 p-6 relative overflow-hidden group flex flex-col bg-white border border-[#E2E8F0] shadow-sm rounded-2xl h-full" style={{ borderTop: "4px solid #10B981" }}>
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
                    {activeSarDraft.status === "filed" ? (
                      <div className="flex items-center gap-2 mb-4 text-[#2563EB] text-xs font-mono px-3 py-1.5 rounded w-fit animate-pulse" style={{ backgroundColor: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.2)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SUBMITTED TO FINCEN
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-4 text-[#10B981] text-xs font-mono px-3 py-1.5 rounded w-fit" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        DRAFT GENERATED
                      </div>
                    )}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex-1 overflow-y-auto scrollbar-hide text-sm">
                      <div className="font-mono mb-3 text-xs" style={{ color: "#2563EB" }}>
                        REPORT_ID: {activeSarDraft.id}<br/>
                        TIMESTAMP: {activeSarDraft.createdAt}
                      </div>
                      <h4 className="font-bold text-[#0F172A] mb-2">{activeSarDraft.subject}</h4>
                      {isEditing ? (
                        <textarea
                          value={editedNarrative}
                          onChange={(e) => setEditedNarrative(e.target.value)}
                          className="w-full h-[calc(100%-80px)] min-h-[300px] p-3 border border-[#E2E8F0] rounded-lg bg-white font-sans text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none text-[#334155] leading-relaxed"
                          placeholder="Edit the SAR narrative..."
                        />
                      ) : (
                        <div className="space-y-4 text-[#475569] leading-relaxed">
                          {activeSarDraft.narrative.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="mt-4 flex gap-3">
                        <button 
                          className="flex-1 bg-white hover:bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] rounded-lg py-2.5 text-sm font-medium transition-colors"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
                          onClick={() => {
                            if (activeSarDraft) {
                              setActiveSar({ ...activeSarDraft, narrative: editedNarrative });
                            }
                            setIsEditing(false);
                            setToastMessage("Draft saved successfully.");
                            setTimeout(() => setToastMessage(""), 3000);
                          }}
                        >
                          Save Draft
                        </button>
                      </div>
                    ) : activeSarDraft.status === "filed" ? (
                      <div className="mt-4 flex flex-col gap-2">
                        <div className="w-full text-center text-xs text-[#2563EB] font-semibold py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                          Filed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-3">
                        <button 
                          className="flex-1 bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0] rounded-lg py-2.5 text-sm font-medium transition-colors"
                          onClick={handleEditDraft}
                        >
                          Edit Draft
                        </button>
                        <button 
                          className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                          onClick={handleFileToFincen}
                          disabled={isFiling}
                        >
                          {isFiling ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                          {isFiling ? "Filing..." : "File to FinCEN"}
                        </button>
                      </div>
                    )}
                    {/* Inline Toast */}
                    <AnimatePresence>
                      {toastMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-4 left-4 right-4 bg-[#0F172A] text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                          {toastMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
