"use client";

import { SurfaceCard } from "@/components/ui/GlassCard";
import { Settings, Sliders, HardDrive, Bell, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: "#64748B" }} />
            Platform Configuration
          </h1>
          <p className="page-subtitle">Manage ML thresholds, visual preferences, and integrations.</p>
        </div>
        <button className="btn-primary">
          <Save className="w-3.5 h-3.5" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Thresholds */}
        <SurfaceCard className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontSize: "13px", color: "#0F172A" }}>
            <Sliders className="w-4 h-4" style={{ color: "#7C3AED" }} />
            Risk Thresholds
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block mb-2" style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>
                Critical Anomaly Cutoff
              </label>
              <input type="range" min="0" max="100" defaultValue="72" className="w-full" style={{ accentColor: "#DC2626" }} />
              <div className="text-right mt-1" style={{ fontSize: "11px", color: "#334155", fontFamily: "monospace", fontWeight: 600 }}>
                0.72
              </div>
            </div>
            <div>
              <label className="block mb-2" style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>
                Monitoring Anomaly Cutoff
              </label>
              <input type="range" min="0" max="100" defaultValue="50" className="w-full" style={{ accentColor: "#1A56DB" }} />
              <div className="text-right mt-1" style={{ fontSize: "11px", color: "#334155", fontFamily: "monospace", fontWeight: 600 }}>
                0.50
              </div>
            </div>
          </div>
        </SurfaceCard>

        {/* Graph Engine */}
        <SurfaceCard className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontSize: "13px", color: "#0F172A" }}>
            <HardDrive className="w-4 h-4" style={{ color: "#1A56DB" }} />
            Graph Engine
          </h3>
          <div className="space-y-3">
            {[
              { label: "Max Render Nodes", value: "5,000" },
              { label: "Physics Iterations", value: "50" },
              { label: "Auto-collapse Degrees", value: "> 3" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <label style={{ fontSize: "12px", color: "#64748B" }}>{item.label}</label>
                <span style={{ fontSize: "12px", color: "#0F172A", fontFamily: "monospace", fontWeight: 700 }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        {/* Notifications */}
        <SurfaceCard className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontSize: "13px", color: "#0F172A" }}>
            <Bell className="w-4 h-4" style={{ color: "#DC2626" }} />
            Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label style={{ fontSize: "12px", color: "#64748B" }}>Critical Alert Sound</label>
              <input type="checkbox" defaultChecked style={{ accentColor: "#DC2626", width: "16px", height: "16px", cursor: "pointer" }} />
            </div>
            <div className="flex items-center justify-between">
              <label style={{ fontSize: "12px", color: "#64748B" }}>Webhooks (Kafka)</label>
              <span
                className="px-2 py-0.5 rounded font-semibold"
                style={{ fontSize: "11px", background: "#DCFCE7", color: "#15803D", border: "1px solid #BBF7D0" }}
              >
                ACTIVE
              </span>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
