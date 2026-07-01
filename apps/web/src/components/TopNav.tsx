"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Bell, ChevronRight, CheckCircle, AlertTriangle, Circle, FolderOpen, ArrowRight } from "lucide-react";
import { useAMLStore } from "@/store/useAMLStore";
import { useInvestigationStore } from "@/store/useInvestigationStore";
import { usePathname, useRouter } from "next/navigation";
import { MOCK_TRANSACTIONS } from "@/data";

// Map href segments to readable breadcrumb labels
const BREADCRUMB_MAP: Record<string, { section: string; label: string }> = {
  dashboard: { section: "Monitor", label: "Overview" },
  alerts: { section: "Monitor", label: "Alert Queue" },
  realtime: { section: "Monitor", label: "Realtime Feed" },
  risk: { section: "Investigate", label: "Entity Search" },
  investigations: { section: "Investigate", label: "Investigations" },
  communities: { section: "Investigate", label: "Communities" },
  temporal: { section: "Intelligence", label: "Analytics" },
  tgnn: { section: "Intelligence", label: "Graph Network" },
  copilot: { section: "Intelligence", label: "AI Copilot" },
  settings: { section: "System", label: "Settings" },
};

export function TopNav() {
  const { isStreaming } = useAMLStore();
  const pathname = usePathname();
  const router = useRouter();
  const { investigations, addInvestigation, setActiveInvestigation } = useInvestigationStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build breadcrumb from pathname
  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const crumb = BREADCRUMB_MAP[segment] ?? { section: "STAR", label: segment };

  // Get unique entities from mock data
  const allEntities = useMemo(() => {
    const set = new Set<string>();
    MOCK_TRANSACTIONS.forEach(t => {
      set.add(t.from);
      set.add(t.to);
    });
    return Array.from(set);
  }, []);

  // Filter based on search term
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return allEntities.filter(e => e.toLowerCase().includes(term)).slice(0, 5); // Max 5 results
  }, [searchTerm, allEntities]);

  // Handle Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEntity = (entity: string) => {
    // Check if investigation already exists
    const existingCase = investigations.find(i => i.primaryEntity === entity);
    
    if (existingCase) {
      setActiveInvestigation(existingCase.id);
    } else {
      // Create new case
      const newId = `INV-2024-${Math.floor(100 + Math.random() * 900)}`;
      addInvestigation({
        id: newId,
        title: `Investigation: ${entity}`,
        status: "pending",
        primaryEntity: entity,
        riskScore: Math.floor(Math.random() * 50) + 40, // Random risk score for mock
        riskLevel: "Moderate",
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        messages: [],
        summary: `Investigation initiated into subject ${entity} via global search. Preliminary analysis flagged anomalous activities. Further evidence gathering and AI analysis are required to determine the full scope of the activity.`
      });
      setActiveInvestigation(newId);
    }
    
    setSearchTerm("");
    setIsFocused(false);
    inputRef.current?.blur();
    router.push('/investigations');
  };

  return (
    <header
      className="h-14 flex-shrink-0 flex items-center justify-between px-5 z-40"
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 500 }}>
          {crumb.section}
        </span>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#CBD5E1" }} />
        <span style={{ fontSize: "13px", color: "#0F172A", fontWeight: 600 }}>
          {crumb.label}
        </span>
      </div>

      {/* Center: Global Search */}
      <div ref={searchRef} className="flex-1 max-w-sm mx-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <Search className="h-3.5 w-3.5" style={{ color: "#94A3B8" }} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="block w-full pl-9 pr-3 py-1.5 rounded-md text-sm transition-all outline-none relative z-10"
          placeholder="Search entities, accounts or alert IDs…"
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            color: "#334155",
            fontSize: "13px",
            borderColor: isFocused ? "#1A56DB" : "#E2E8F0",
            boxShadow: isFocused ? "0 0 0 3px rgba(26,86,219,0.1)" : "none",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10"
        >
          <span style={{ fontSize: "11px", color: "#CBD5E1", fontFamily: "monospace" }}>⌘K</span>
        </div>

        {/* Dropdown Results */}
        {isFocused && searchTerm.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50">
            {searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-3 pb-2 mb-2 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Entities
                </div>
                {searchResults.map((entity, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectEntity(entity)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center">
                        <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700 font-mono">{entity}</div>
                        <div className="text-[10px] text-slate-400">Open investigation workspace</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Search className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-600">No results found</div>
                <div className="text-[11px] text-slate-400 mt-1">Try searching for an account like ACC-4521</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Status + Actions */}
      <div className="flex items-center gap-3">

        {/* Live stream status badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded"
          style={{
            background: isStreaming ? "#DCFCE7" : "#FEF3C7",
            border: `1px solid ${isStreaming ? "#BBF7D0" : "#FDE68A"}`,
          }}
        >
          {/* Pulsing dot */}
          <span
            className="inline-block rounded-full"
            style={{
              width: "6px",
              height: "6px",
              background: isStreaming ? "#16A34A" : "#D97706",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: isStreaming ? "#15803D" : "#92400E",
            }}
          >
            {isStreaming ? "LIVE" : "PAUSED"}
          </span>
        </div>

        {/* Engine status — compact text indicators */}
        <div
          className="hidden md:flex items-center gap-3 px-3"
          style={{ borderLeft: "1px solid #E2E8F0", paddingLeft: "12px" }}
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 500 }}>IF-300</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 500 }}>GraphSAGE</span>
          </div>
        </div>

        {/* Notifications */}
        <button
          className="relative p-1.5 rounded-md transition-colors"
          style={{ color: "#64748B", background: "transparent" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "#F4F6F9";
            (e.currentTarget as HTMLElement).style.color = "#334155";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#64748B";
          }}
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-0.5 right-0.5 flex items-center justify-center rounded-full text-white font-bold"
            style={{
              width: "14px",
              height: "14px",
              background: "#DC2626",
              fontSize: "8px",
              lineHeight: 1,
            }}
          >
            3
          </span>
        </button>

        {/* User profile */}
        <button
          className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors"
          style={{
            border: "1px solid #E2E8F0",
            background: "#FFFFFF",
            color: "#334155",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "#F8FAFC";
            (e.currentTarget as HTMLElement).style.borderColor = "#CBD5E1";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
            (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "#1A56DB", color: "#FFFFFF" }}
          >
            A4
          </div>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>Analyst_04</span>
        </button>
      </div>
    </header>
  );
}
