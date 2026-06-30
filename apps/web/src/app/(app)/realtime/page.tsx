"use client";

import { motion } from "framer-motion";
import { SurfaceCard } from "@/components/ui/GlassCard";
import { useAMLStore } from "@/store/useAMLStore";
import { useWebSocketSim } from "@/hooks/useWebSocketSim";
import { Activity, ArrowRight, Server, TriangleAlert, Pause, Play } from "lucide-react";
import { formatCurrency } from "@/utils/format";

export default function RealtimePage() {
  const { transactions, isStreaming, toggleStreaming } = useAMLStore();
  useWebSocketSim();

  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col" style={{ background: "#F4F6F9", minHeight: "100%" }}>

      {/* Header */}
      <div className="mb-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity className="w-5 h-5" style={{ color: "#1A56DB" }} />
            Realtime Feed
          </h1>
          <p className="page-subtitle">Live WebSocket ingest and real-time anomaly classification.</p>
          <p className="mt-1" style={{ fontSize: "11px", color: "#D97706" }}>
            Note: This global stream continuously processes data from the backend independently of the TGNN Demo controls.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-bold" style={{ fontSize: "20px", color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
              {transactions.length.toLocaleString()}
            </div>
            <div style={{ fontSize: "10px", color: "#64748B", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Events Ingested
            </div>
          </div>
          <button
            onClick={toggleStreaming}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              background: isStreaming ? "#FEF2F2" : "#DCFCE7",
              color: isStreaming ? "#DC2626" : "#16A34A",
              border: `1px solid ${isStreaming ? "#FECACA" : "#BBF7D0"}`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = isStreaming ? "#FEE2E2" : "#D1FAE5";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = isStreaming ? "#FEF2F2" : "#DCFCE7";
            }}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isStreaming ? "Pause Stream" : "Resume Stream"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">

        {/* Left: Stats */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Latency */}
          <SurfaceCard className="p-5" style={{ borderLeftColor: "#1A56DB", borderLeftWidth: "4px" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontSize: "13px", color: "#0F172A" }}>
              <Server className="w-3.5 h-3.5" style={{ color: "#1A56DB" }} />
              Pipeline Latency
            </h3>
            <div className="space-y-4">
              {[
                { label: "Ingest (Kafka)", val: "4ms", pct: "15%", color: "#1A56DB" },
                { label: "Feature Extract", val: "12ms", pct: "40%", color: "#7C3AED" },
                { label: "IF-300 Score", val: "31ms", pct: "80%", color: "#D97706" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5" style={{ fontSize: "11px" }}>
                    <span style={{ color: "#64748B" }}>{item.label}</span>
                    <span style={{ color: "#0F172A", fontWeight: 600, fontFamily: "monospace" }}>{item.val}</span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: "4px", background: "#F1F5F9" }}>
                    <div className="h-full rounded-full" style={{ width: item.pct, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          {/* Recent anomalies */}
          <SurfaceCard className="p-5 flex-1" style={{ borderLeftColor: "#DC2626", borderLeftWidth: "4px" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontSize: "13px", color: "#0F172A" }}>
              <TriangleAlert className="w-3.5 h-3.5" style={{ color: "#DC2626" }} />
              Recent Anomalies
            </h3>
            <div className="space-y-2">
              {transactions.filter(t => t.anomalyScore >= 0.7).slice(0, 5).map(t => (
                <div
                  key={t.id}
                  className="p-3 rounded-md"
                  style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#0F172A", fontWeight: 600 }}>
                      {t.id}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded font-semibold"
                      style={{ fontSize: "10px", background: "#DC2626", color: "#FFFFFF" }}
                    >
                      {(t.anomalyScore * 100).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1" style={{ fontSize: "11px", color: "#64748B" }}>
                    <span className="truncate" style={{ maxWidth: "60px" }}>{t.from}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate" style={{ maxWidth: "60px" }}>{t.to}</span>
                  </div>
                </div>
              ))}
              {transactions.filter(t => t.anomalyScore >= 0.7).length === 0 && (
                <p style={{ fontSize: "12px", color: "#94A3B8", textAlign: "center", padding: "16px 0" }}>
                  No anomalies detected
                </p>
              )}
            </div>
          </SurfaceCard>
        </div>

        {/* Right: Live Feed Table */}
        <SurfaceCard className="col-span-1 lg:col-span-3 overflow-hidden flex flex-col">
          {/* Table header */}
          <div
            className="grid grid-cols-12 gap-4 px-5 py-3 flex-shrink-0"
            style={{
              background: "#F8FAFC",
              borderBottom: "1px solid #E2E8F0",
              fontSize: "10px",
              fontWeight: 700,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <div className="col-span-2">Time / ID</div>
            <div className="col-span-3">Sender</div>
            <div className="col-span-3">Receiver</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Risk Score</div>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {transactions.slice(0, 50).map((txn) => {
              const isAnomaly = txn.anomalyScore >= 0.7;
              return (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-12 gap-4 px-5 items-center"
                  style={{
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #F1F5F9",
                    background: isAnomaly ? "#FEF2F2" : "#FFFFFF",
                    fontSize: "12px",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = isAnomaly ? "#FEE2E2" : "#F8FAFC";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = isAnomaly ? "#FEF2F2" : "#FFFFFF";
                  }}
                >
                  <div className="col-span-2">
                    <div style={{ color: "#0F172A", fontFamily: "monospace", fontWeight: 600 }}>{txn.timestamp}</div>
                    <div style={{ fontSize: "10px", color: "#94A3B8", fontFamily: "monospace" }}>{txn.id}</div>
                  </div>
                  <div className="col-span-3 truncate" style={{ color: "#334155", fontFamily: "monospace" }}>{txn.from}</div>
                  <div className="col-span-3 truncate" style={{ color: "#334155", fontFamily: "monospace" }}>{txn.to}</div>
                  <div
                    className="col-span-2 text-right font-bold"
                    style={{
                      color: isAnomaly ? "#DC2626" : "#0F172A",
                      fontFamily: "monospace",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatCurrency(txn.amount)}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <span
                      className="px-2 py-1 rounded font-bold"
                      style={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        background: isAnomaly ? "#DC2626" : "#DCFCE7",
                        color: isAnomaly ? "#FFFFFF" : "#15803D",
                      }}
                    >
                      {(txn.anomalyScore * 100).toFixed(0)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
