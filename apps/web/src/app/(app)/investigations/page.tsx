"use client";

import { SurfaceCard } from "@/components/ui/GlassCard";
import { Briefcase, FolderOpen, Plus } from "lucide-react";

export default function InvestigationsPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Briefcase className="w-5 h-5" style={{ color: "#1A56DB" }} />
            Investigations
          </h1>
          <p className="page-subtitle">Investigator workspace and SAR filings.</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-3.5 h-3.5" />
          New Case
        </button>
      </div>

      <SurfaceCard className="flex flex-col items-center justify-center" style={{ minHeight: "440px", borderStyle: "dashed" }}>
        <FolderOpen className="w-12 h-12 mb-4" style={{ color: "#CBD5E1" }} />
        <h2 className="font-semibold mb-2" style={{ fontSize: "16px", color: "#334155" }}>
          No Active Cases
        </h2>
        <p className="text-center max-w-md" style={{ fontSize: "13px", color: "#94A3B8" }}>
          Start an investigation from the Alert Queue or AI Copilot to generate a new case file.
        </p>
      </SurfaceCard>
    </div>
  );
}
