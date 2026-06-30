"use client";

import { Search, Bell, ChevronRight, CheckCircle, AlertTriangle, Circle } from "lucide-react";
import { useAMLStore } from "@/store/useAMLStore";
import { usePathname } from "next/navigation";

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

  // Build breadcrumb from pathname
  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const crumb = BREADCRUMB_MAP[segment] ?? { section: "STAR", label: segment };

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
      <div className="flex-1 max-w-sm mx-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5" style={{ color: "#94A3B8" }} />
        </div>
        <input
          type="text"
          className="block w-full pl-9 pr-3 py-1.5 rounded-md text-sm transition-all outline-none"
          placeholder="Search entities, accounts or alert IDs…"
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            color: "#334155",
            fontSize: "13px",
          }}
          onFocus={e => {
            e.target.style.borderColor = "#1A56DB";
            e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.1)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "#E2E8F0";
            e.target.style.boxShadow = "none";
          }}
        />
        <div
          className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
        >
          <span style={{ fontSize: "11px", color: "#CBD5E1", fontFamily: "monospace" }}>⌘K</span>
        </div>
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
