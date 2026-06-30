"use client";

import { useState, useEffect } from "react";
import { SurfaceCard, GlassCard } from "@/components/ui/GlassCard";
import { 
  Briefcase, FolderOpen, Plus, FileText, ShieldAlert, 
  Search, CheckCircle2, AlertTriangle, FileEdit, ChevronRight, Save, Send,
  Activity, ArrowRight, Calendar, User, Clock, Flag, Trash2, Edit3
} from "lucide-react";
import { useInvestigationStore } from "@/store/useInvestigationStore";
import { useRouter } from "next/navigation";
import { MOCK_TRANSACTIONS } from "@/data";

export default function InvestigationsPage() {
  const router = useRouter();
  const { 
    activeInvestigationId, 
    setActiveInvestigation, 
    investigations,
    addInvestigation,
    updateInvestigation,
    removeInvestigation,
    clearAllInvestigations
  } = useInvestigationStore();

  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "sar">("overview");

  const activeInv = investigations.find((i) => i.id === activeInvestigationId);
  const activeSarDraft = activeInv?.sarDraft || null;

  // Local state for the SAR form
  const [sarForm, setSarForm] = useState({
    subject: "",
    narrative: "",
    dateRange: "",
    pattern: "",
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [newCaseForm, setNewCaseForm] = useState({
    title: "",
    primaryEntity: "",
    riskLevel: "Normal",
    summary: "",
    status: "pending",
  });

  useEffect(() => {
    if (activeSarDraft) {
      setSarForm({
        subject: activeSarDraft.subject || "",
        narrative: activeSarDraft.narrative || "",
        dateRange: activeSarDraft.dateRange || "",
        pattern: activeSarDraft.pattern || "",
      });
    }
  }, [activeSarDraft]);

  const handleSaveDraft = () => {
    if (activeSarDraft && activeInvestigationId) {
      updateInvestigation(activeInvestigationId, {
        sarDraft: { ...activeSarDraft, ...sarForm, status: "draft" }
      });
    }
  };

  const handleSubmitSAR = () => {
    if (activeSarDraft && activeInvestigationId) {
      updateInvestigation(activeInvestigationId, {
        status: "closed",
        sarDraft: { ...activeSarDraft, ...sarForm, status: "submitted" }
      });
    }
  };

  const handleOpenNewCaseModal = () => {
    setEditingCaseId(null);
    setNewCaseForm({ title: "", primaryEntity: "", riskLevel: "Normal", summary: "", status: "pending" });
    setIsModalOpen(true);
  };

  const handleEditCase = () => {
    if (!activeInv) return;
    setEditingCaseId(activeInv.id);
    setNewCaseForm({ 
      title: activeInv.title, 
      primaryEntity: activeInv.primaryEntity, 
      riskLevel: activeInv.riskLevel || "Normal",
      summary: activeInv.summary || "",
      status: activeInv.status || "pending"
    });
    setIsModalOpen(true);
  };

  const handleDeleteCase = () => {
    if (!activeInv) return;
    if (confirm("Are you sure you want to delete this case?")) {
      removeInvestigation(activeInv.id);
      setActiveTab("overview");
    }
  };

  const handleSaveCase = () => {
    const generatedSummary = `Investigation initiated into subject ${newCaseForm.primaryEntity || "Unknown"} under the context of "${newCaseForm.title || "Untitled"}". Preliminary analysis flagged anomalous activities matching patterns for a ${newCaseForm.riskLevel || "Normal"} risk profile. Further evidence gathering and AI analysis are required to determine the full scope of the activity.`;
    const finalSummary = newCaseForm.summary.trim() ? newCaseForm.summary : generatedSummary;

    if (editingCaseId) {
      updateInvestigation(editingCaseId, {
        title: newCaseForm.title || "Untitled Investigation",
        primaryEntity: newCaseForm.primaryEntity || "Unknown",
        riskScore: newCaseForm.riskLevel === "Critical" ? 95 : newCaseForm.riskLevel === "High" ? 75 : newCaseForm.riskLevel === "Moderate" ? 50 : 15,
        riskLevel: newCaseForm.riskLevel,
        status: newCaseForm.status as any,
        summary: finalSummary
      });
    } else {
      const newId = `INV-2024-${Math.floor(100 + Math.random() * 900)}`;
      addInvestigation({
        id: newId,
        title: newCaseForm.title || "Untitled Investigation",
        status: newCaseForm.status as any,
        primaryEntity: newCaseForm.primaryEntity || "Unknown",
        riskScore: newCaseForm.riskLevel === "Critical" ? 95 : newCaseForm.riskLevel === "High" ? 75 : newCaseForm.riskLevel === "Moderate" ? 50 : 15,
        riskLevel: newCaseForm.riskLevel,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        messages: [],
        summary: finalSummary
      });
      setActiveInvestigation(newId);
    }
    setIsModalOpen(false);
    setActiveTab("overview");
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col" style={{ background: "#F4F6F9", height: "calc(100vh - 56px)" }}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Briefcase className="w-5 h-5" style={{ color: "#1A56DB" }} />
            Investigations
          </h1>
          <p className="page-subtitle">Investigator workspace and SAR filings.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenNewCaseModal}>
          <Plus className="w-3.5 h-3.5" />
          New Case
        </button>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Sidebar - Cases List */}
        <div className="w-80 flex flex-col gap-3 shrink-0 overflow-y-auto pr-2">
          <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Active Cases</div>
          
          {investigations.map((inv) => (
            <div 
              key={inv.id}
              onClick={() => setActiveInvestigation(inv.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all border shadow-sm ${
                activeInvestigationId === inv.id 
                  ? "bg-white border-[#2563EB]" 
                  : "bg-slate-50 border-[#E2E8F0] hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#475569]">{inv.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  inv.riskLevel === "Critical" ? "bg-rose-100 text-rose-700" :
                  inv.riskLevel === "High" ? "bg-orange-100 text-orange-700" :
                  inv.riskLevel === "Normal" ? "bg-emerald-100 text-emerald-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {inv.riskLevel} Risk
                </span>
              </div>
              <h3 className="font-semibold text-sm text-[#0F172A] mb-1">{inv.title}</h3>
              <div className="text-[11px] text-[#64748B] flex items-center justify-between">
                <span>Opened: {inv.createdAt}</span>
                <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> {inv.riskScore}</span>
              </div>
            </div>
          ))}

          {investigations.length > 0 && (
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to clear all cases? This cannot be undone.")) {
                  clearAllInvestigations();
                }
              }}
              className="mt-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Cases
            </button>
          )}
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {!activeInv ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <FolderOpen className="w-12 h-12 mb-4 text-[#CBD5E1]" />
              <h2 className="font-semibold text-base text-[#334155] mb-2">No Case Selected</h2>
              <p className="text-[13px] text-[#94A3B8]">Select an active investigation from the sidebar to view details.</p>
            </div>
          ) : (
            <>
              {/* Workspace Header */}
              <div className="px-6 py-5 border-b border-[#E2E8F0] bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0F172A]">{activeInv.title}</h2>
                      <div className="flex items-center gap-2 text-xs text-[#64748B] font-mono mt-0.5">
                        <span>{activeInv.id}</span>
                        <span>•</span>
                        <span className={`uppercase font-semibold ${activeInv.status === 'closed' ? 'text-slate-400' : 'text-emerald-600'}`}>{activeInv.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">Risk Score</div>
                      <div className="text-xl font-bold text-rose-600 tabular-nums">{activeInv.riskScore}</div>
                    </div>
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-4 ml-2">
                      <button onClick={handleEditCase} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Case">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={handleDeleteCase} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete Case">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-[#E2E8F0] -mx-6 px-6 -mb-5">
                  {(["overview", "evidence", "sar"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-semibold capitalize transition-colors relative ${
                        activeTab === tab ? "text-blue-600" : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      {tab === "sar" ? "SAR Filing" : tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {activeTab === "overview" && (
                  <div className="max-w-4xl space-y-6">
                    {/* Key Details Grid */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="text-xs font-semibold text-[#64748B] uppercase mb-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Primary Subject</div>
                        <div className="font-bold text-[#0F172A]">{activeInv.primaryEntity}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="text-xs font-semibold text-[#64748B] uppercase mb-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Date Opened</div>
                        <div className="font-bold text-[#0F172A]">{activeInv.createdAt}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="text-xs font-semibold text-[#64748B] uppercase mb-2 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Status</div>
                        <div className="font-bold text-[#0F172A] capitalize">{activeInv.status}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="text-xs font-semibold text-[#64748B] uppercase mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5"/> Risk Score</div>
                        <div className="font-bold text-rose-600">{activeInv.riskScore} / 100</div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
                      <h3 className="text-sm font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        Investigation Summary
                      </h3>
                      <p className="text-sm text-[#475569] leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {activeInv.summary}
                      </p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A] mb-1">AI Copilot Analysis</h4>
                        <p className="text-xs text-[#64748B]">Let the AI agent assist in traversing the transaction graph to gather evidence.</p>
                      </div>
                      <button 
                        onClick={() => router.push('/copilot')}
                        className="btn-secondary"
                      >
                        Open Copilot <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "evidence" && (
                  <div className="max-w-5xl space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        <Flag className="w-4 h-4 text-blue-500" />
                        Tagged Transactions Evidence
                      </h3>
                      <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                        Subject: {activeInv.primaryEntity}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                      <div className="grid grid-cols-6 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-1">ID / Time</div>
                        <div className="col-span-2">Flow (From → To)</div>
                        <div className="col-span-1">Amount</div>
                        <div className="col-span-1">Type</div>
                        <div className="col-span-1 text-right">Risk</div>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {(() => {
                          const entityTxs = MOCK_TRANSACTIONS.filter(t => t.from === activeInv.primaryEntity || t.to === activeInv.primaryEntity);
                          
                          if (entityTxs.length === 0) {
                            return (
                              <div className="p-8 flex flex-col items-center text-center text-[#64748B] text-sm">
                                <Search className="w-8 h-8 text-slate-300 mb-3" />
                                <p>No tagged evidence found for <strong>{activeInv.primaryEntity}</strong>.</p>
                                <p className="text-xs mt-1 text-slate-400">Transactions pinned from the Graph Explorer will appear here.</p>
                              </div>
                            );
                          }
                          
                          return entityTxs.map(tx => (
                            <div key={tx.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors">
                              <div className="col-span-1">
                                <div className="font-mono text-xs font-bold text-slate-700">{tx.id}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3"/> {tx.timestamp}</div>
                              </div>
                              <div className="col-span-2 flex items-center gap-2 text-sm font-medium">
                                <span className={tx.from === activeInv.primaryEntity ? "text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100" : "text-slate-600"}>{tx.from}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                                <span className={tx.to === activeInv.primaryEntity ? "text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100" : "text-slate-600"}>{tx.to}</span>
                              </div>
                              <div className="col-span-1 font-mono text-sm text-slate-700 font-semibold">
                                ${tx.amount.toLocaleString()}
                              </div>
                              <div className="col-span-1">
                                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{tx.type}</span>
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                                  tx.risk === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                  tx.risk === 'high' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                                  tx.risk === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                  'bg-emerald-50 border-emerald-200 text-emerald-600'
                                }`}>
                                  {tx.risk}
                                </span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "sar" && (
                  <div className="max-w-4xl mx-auto">
                    {!activeSarDraft ? (
                      <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-[#0F172A] mb-2">No SAR Draft Generated</h3>
                        <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
                          Use the AI Copilot to automatically draft a Suspicious Activity Report based on the transaction graph findings for {activeInv.title}.
                        </p>
                        <button 
                          onClick={() => router.push('/copilot')}
                          className="btn-primary mx-auto"
                        >
                          Generate via Copilot
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                        {/* FinCEN Header */}
                        <div className="bg-[#0F172A] p-4 flex items-center justify-between text-white">
                          <div className="flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="text-xs text-slate-400 font-mono">FINCEN FORM 111</div>
                              <div className="text-sm font-bold tracking-wide uppercase">Suspicious Activity Report</div>
                            </div>
                          </div>
                          {activeSarDraft.status === "submitted" && (
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" /> FILED
                            </span>
                          )}
                        </div>

                        <div className="p-6 space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5">Primary Subject</label>
                              <input 
                                type="text"
                                value={sarForm.subject}
                                onChange={(e) => setSarForm({...sarForm, subject: e.target.value})}
                                disabled={activeSarDraft.status === "submitted"}
                                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-70"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5">Detected Pattern</label>
                              <input 
                                type="text"
                                value={sarForm.pattern}
                                onChange={(e) => setSarForm({...sarForm, pattern: e.target.value})}
                                disabled={activeSarDraft.status === "submitted"}
                                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-70"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5">Activity Date Range</label>
                              <input 
                                type="text"
                                value={sarForm.dateRange}
                                onChange={(e) => setSarForm({...sarForm, dateRange: e.target.value})}
                                disabled={activeSarDraft.status === "submitted"}
                                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-70"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5">Total Entities</label>
                                <div className="text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-[#0F172A]">
                                  {activeSarDraft.entityCount}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5">Total Vol (USD)</label>
                                <div className="text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-[#0F172A]">
                                  ${activeSarDraft.totalAmount.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5 flex items-center justify-between">
                              Suspicious Activity Information / Narrative
                              <span className="normal-case font-normal text-slate-400">AI Generated</span>
                            </label>
                            <textarea 
                              value={sarForm.narrative}
                              onChange={(e) => setSarForm({...sarForm, narrative: e.target.value})}
                              disabled={activeSarDraft.status === "submitted"}
                              className="w-full text-[13px] leading-relaxed p-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all h-64 resize-none disabled:opacity-70"
                            />
                          </div>

                          {activeSarDraft.status !== "submitted" && (
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                              <button onClick={handleSaveDraft} className="btn-secondary">
                                <Save className="w-4 h-4" /> Save Draft
                              </button>
                              <button onClick={handleSubmitSAR} className="btn-primary">
                                <Send className="w-4 h-4" /> Submit to FinCEN
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F172A]">{editingCaseId ? "Edit Investigation" : "Create New Investigation"}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5">Case Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Shell Company Layering"
                  value={newCaseForm.title}
                  onChange={(e) => setNewCaseForm({...newCaseForm, title: e.target.value})}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5">Primary Subject / Entity ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. ACC-1001"
                  value={newCaseForm.primaryEntity}
                  onChange={(e) => setNewCaseForm({...newCaseForm, primaryEntity: e.target.value})}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5">Initial Risk Level</label>
                  <select 
                    value={newCaseForm.riskLevel}
                    onChange={(e) => setNewCaseForm({...newCaseForm, riskLevel: e.target.value})}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5">Case Status</label>
                  <select 
                    value={newCaseForm.status}
                    onChange={(e) => setNewCaseForm({...newCaseForm, status: e.target.value})}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1.5 flex justify-between">
                  Investigation Summary
                  <span className="font-normal text-slate-400 normal-case">Optional</span>
                </label>
                <textarea 
                  placeholder="Enter a custom narrative... (Leave blank to auto-generate)"
                  value={newCaseForm.summary}
                  onChange={(e) => setNewCaseForm({...newCaseForm, summary: e.target.value})}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCase}
                className="btn-primary"
                disabled={!newCaseForm.title || !newCaseForm.primaryEntity}
              >
                {editingCaseId ? "Save Changes" : "Create Case"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
