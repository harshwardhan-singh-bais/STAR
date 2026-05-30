"use client";

import { Search, Bell, Activity, ShieldCheck, User } from "lucide-react";
import { PulsingDot } from "@/components/ui/TerminalText";
import { useAMLStore } from "@/store/useAMLStore";

export function TopNav() {
  const { isStreaming } = useAMLStore();

  return (
    <header className="h-16 sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between px-6 z-40 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
      
      {/* Left: Global Search */}
      <div className="flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#64748B]" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#1E40AF]/50 focus:border-[#1E40AF]/50 transition-all"
          placeholder="Search entities, accounts, or alert IDs... (⌘K)"
        />
      </div>

      {/* Right: Status & Profile */}
      <div className="flex items-center gap-6">
        
        {/* ML Pipeline Status */}
        <div className="hidden md:flex items-center gap-4 border-r border-[#E2E8F0] pr-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-[10px] font-mono text-[#64748B] uppercase">IF-300 Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[10px] font-mono text-[#64748B] uppercase">GraphSAGE</span>
          </div>
        </div>

        {/* WebSocket Stream Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0]">
          <PulsingDot color={isStreaming ? "#059669" : "#D97706"} size={1.5} />
          <span className={`text-[10px] font-mono font-bold tracking-widest ${isStreaming ? "text-[#059669]" : "text-[#D97706]"}`}>
            {isStreaming ? "LIVE STREAM" : "PAUSED"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0] rounded-lg transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full border border-white" />
          </button>
          
          <button className="flex items-center gap-2 p-1.5 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full hover:bg-[#E2E8F0] transition-colors">
            <div className="w-6 h-6 rounded-full bg-[#1E40AF]/10 flex items-center justify-center border border-[#1E40AF]/20">
              <User className="w-3 h-3 text-[#1E40AF]" />
            </div>
            <span className="text-xs font-medium text-[#0F172A]">Analyst_04</span>
          </button>
        </div>
      </div>
    </header>
  );
}
