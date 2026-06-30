"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { SurfaceCard } from "@/components/ui/GlassCard";
import { useAMLStore } from "@/store/useAMLStore";
import { starApi } from "@/lib/api";
import {
  ShieldAlert,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  ChevronDown,
  Search,
  Download,
  CheckSquare,
} from "lucide-react";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { STAGGER_CONTAINER, STAGGER_ITEM_UP } from "@/animations/variants";

const SEVERITY_OPTIONS = ["All", "Critical", "High", "Medium", "Low"];
const STATUS_OPTIONS = ["All", "Open", "Investigating", "Resolved"];

export default function AlertsPage() {
  const { alerts, setAlerts } = useAMLStore();
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"id" | "time" | "amount">("time");

  useEffect(() => {
    starApi.getAlerts().then(data => setAlerts(data as any)).catch(() => {});
  }, [setAlerts]);

  const filtered = alerts.filter(alert => {
    const matchSeverity = severityFilter === "All" || alert.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchStatus = statusFilter === "All" || alert.status.toLowerCase() === statusFilter.toLowerCase();
    const matchSearch = !searchQuery || alert.id.toLowerCase().includes(searchQuery.toLowerCase()) || alert.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSeverity && matchStatus && matchSearch;
  });

  const criticalCount = alerts.filter(a => a.severity.toLowerCase() === "critical").length;
  const highCount = alerts.filter(a => a.severity.toLowerCase() === "high").length;
  const openCount = alerts.filter(a => a.status.toLowerCase() === "open").length;

  const FADE_UP: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.04, duration: 0.2, ease: "easeOut" },
    }),
  };

  const statusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === "open") return { bg: "#FEE2E2", color: "#DC2626", border: "#FECACA" };
    if (s === "investigating") return { bg: "#FEF3C7", color: "#D97706", border: "#FDE68A" };
    return { bg: "#DCFCE7", color: "#16A34A", border: "#BBF7D0" };
  };

  const severityBarColor: Record<string, string> = {
    critical: "#DC2626",
    high: "#D97706",
    medium: "#CA8A04",
    low: "#16A34A",
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto" style={{ background: "#F4F6F9", minHeight: "100%" }}>

      {/* ── Page Header ──────────────────────────────────── */}
      <motion.div
        custom={0} variants={FADE_UP} initial="hidden" animate="visible"
        className="mb-5 flex items-start justify-between"
      >
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" style={{ color: "#DC2626" }} />
            Alert Queue
          </h1>
          <p className="page-subtitle">
            {openCount} alerts require action · {criticalCount} critical · {highCount} high
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors text-sm"
            style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#FEE2E2")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#FEF2F2")}
          >
            Auto-Triage Active
          </button>
        </div>
      </motion.div>

      {/* ── Summary Stats Row ────────────────────────────── */}
      <motion.div
        custom={1} variants={FADE_UP} initial="hidden" animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
      >
        {[
          { label: "Total Alerts", value: alerts.length, color: "#1A56DB" },
          { label: "Open", value: openCount, color: "#DC2626" },
          { label: "Critical", value: criticalCount, color: "#DC2626" },
          { label: "High Priority", value: highCount, color: "#D97706" },
        ].map(stat => (
          <div
            key={stat.label}
            className="surface-card px-4 py-3 flex items-center justify-between"
          >
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>{stat.label}</span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: stat.color, fontVariantNumeric: "tabular-nums" }}>
              {stat.value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ── Filter Bar ───────────────────────────────────── */}
      <motion.div
        custom={2} variants={FADE_UP} initial="hidden" animate="visible"
      >
        <SurfaceCard className="p-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: "#94A3B8" }}
              />
              <input
                type="text"
                placeholder="Search alerts, IDs, types..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input pl-8"
              />
            </div>

            <div
              className="w-px self-stretch"
              style={{ background: "#E2E8F0" }}
            />

            {/* Severity filter */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>Severity:</span>
              <div className="flex gap-1">
                {SEVERITY_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSeverityFilter(opt)}
                    className="px-3 py-1 rounded text-xs font-medium transition-colors"
                    style={{
                      background: severityFilter === opt ? "#1A56DB" : "#F8FAFC",
                      color: severityFilter === opt ? "#FFFFFF" : "#64748B",
                      border: `1px solid ${severityFilter === opt ? "#1A56DB" : "#E2E8F0"}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px self-stretch" style={{ background: "#E2E8F0" }} />

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>Status:</span>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setStatusFilter(opt)}
                    className="px-3 py-1 rounded text-xs font-medium transition-colors"
                    style={{
                      background: statusFilter === opt ? "#1A56DB" : "#F8FAFC",
                      color: statusFilter === opt ? "#FFFFFF" : "#64748B",
                      border: `1px solid ${statusFilter === opt ? "#1A56DB" : "#E2E8F0"}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto" style={{ fontSize: "12px", color: "#94A3B8" }}>
              {filtered.length} of {alerts.length} alerts
            </div>
          </div>
        </SurfaceCard>
      </motion.div>

      {/* ── Alerts Table ─────────────────────────────────── */}
      <motion.div custom={3} variants={FADE_UP} initial="hidden" animate="visible">
        <SurfaceCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "4px", padding: "10px 0", borderRight: "none" }} />
                  <th>
                    <button
                      className="flex items-center gap-1 hover:text-[#334155] transition-colors"
                      onClick={() => setSortField("id")}
                    >
                      Alert ID
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Entities</th>
                  <th className="text-right">
                    <button
                      className="flex items-center gap-1 hover:text-[#334155] transition-colors ml-auto"
                      onClick={() => setSortField("amount")}
                    >
                      Amount at Risk
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right">
                    <button
                      className="flex items-center gap-1 hover:text-[#334155] transition-colors ml-auto"
                      onClick={() => setSortField("time")}
                    >
                      Time
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th style={{ width: "48px" }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((alert, i) => {
                  const st = statusStyle(alert.status);
                  const barColor = severityBarColor[alert.severity?.toLowerCase()] ?? "#94A3B8";

                  return (
                    <motion.tr
                      key={alert.id}
                      custom={i}
                      variants={FADE_UP}
                      initial="hidden"
                      animate="visible"
                      className="group cursor-pointer"
                    >
                      {/* Priority bar */}
                      <td style={{ padding: 0, width: "4px" }}>
                        <div
                          style={{
                            width: "4px",
                            height: "100%",
                            minHeight: "44px",
                            background: barColor,
                          }}
                        />
                      </td>

                      {/* ID */}
                      <td>
                        <span
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: "12px",
                            color: "#1A56DB",
                            fontWeight: 600,
                          }}
                        >
                          {alert.id}
                        </span>
                      </td>

                      {/* Type */}
                      <td>
                        <span style={{ color: "#0F172A", fontWeight: 500 }}>
                          {alert.type.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Severity */}
                      <td>
                        <RiskBadge level={alert.severity} />
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded font-semibold"
                          style={{
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.border}`,
                            fontSize: "11px",
                          }}
                        >
                          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Entities */}
                      <td style={{ color: "#64748B", fontSize: "12px" }}>
                        {alert.entityCount ?? "—"}
                      </td>

                      {/* Amount */}
                      <td className="text-right">
                        <span
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#0F172A",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {alert.amount}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="text-right">
                        <span style={{ fontSize: "11px", color: "#94A3B8", fontVariantNumeric: "tabular-nums" }}>
                          {alert.time}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            className="px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-all"
                            style={{ background: "#EFF6FF", color: "#1A56DB", border: "1px solid #DBEAFE" }}
                          >
                            Assign
                          </button>
                          <button
                            className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                            style={{ color: "#94A3B8" }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12"
                      style={{ color: "#94A3B8", fontSize: "13px" }}
                    >
                      No alerts match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      </motion.div>
    </div>
  );
}
