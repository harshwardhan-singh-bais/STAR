"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExportReportModal } from "@/components/ui/ExportReportModal";
import { motion, Variants } from "framer-motion";
import { SurfaceCard } from "@/components/ui/GlassCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { TransactionVolumeChart } from "@/components/charts/TransactionVolumeChart";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { useAMLStore } from "@/store/useAMLStore";
import { useWebSocketSim } from "@/hooks/useWebSocketSim";
import { starApi, SystemHealth } from "@/lib/api";
import {
  Activity,
  ShieldAlert,
  Crosshair,
  Network,
  BarChart2,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Clock,
  FileText,
} from "lucide-react";
import { getRiskColor } from "@/utils/format";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.25, ease: "easeOut" },
  }),
};

export default function DashboardPage() {
  const { alerts, transactions } = useAMLStore();
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [volumeData, setVolumeData] = useState([
    { time: "00:00", volume: 1200, anomaly: 0 },
    { time: "04:00", volume: 900, anomaly: 200 },
    { time: "08:00", volume: 3400, anomaly: 0 },
    { time: "12:00", volume: 5600, anomaly: 400 },
    { time: "16:00", volume: 4800, anomaly: 1200 },
    { time: "20:00", volume: 2100, anomaly: 100 },
    { time: "24:00", volume: 1500, anomaly: 0 },
  ]);

  useWebSocketSim();

  useEffect(() => {
    setLastUpdated(new Date());
    const fetchHealth = () => {
      starApi
        .getHealth()
        .then((d) => {
          setHealthData(d);
          setLastUpdated(new Date());
        })
        .catch(() => {});
      starApi.getMetrics().then(setMetricsData).catch(() => {});
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!metricsData) return;

    // Shift volume data to create a scrolling live chart effect
    setVolumeData(prev => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      
      // Calculate growth based on metrics, adding some random jitter for realism
      const txVolume = Math.max(500, (metricsData.transactions_scored || 0) * 120 + Math.random() * 500);
      const anomalyCount = (metricsData.active_alerts || 0) * 150 + Math.random() * 200;

      // Append new data point and shift out the oldest
      return [...prev.slice(1), {
        time: timeStr,
        volume: txVolume,
        anomaly: anomalyCount
      }];
    });
  }, [metricsData]);

  const formatTime = (d: Date | null) =>
    d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--";

  const serviceIcon = (status: string) => {
    if (status === "online") return <CheckCircle className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />;
    if (status === "degraded") return <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#D97706" }} />;
    return <XCircle className="w-3.5 h-3.5" style={{ color: "#DC2626" }} />;
  };

  const recentAlerts = alerts.slice(0, 8);

  return (
    <div
      className="p-6 max-w-[1600px] mx-auto"
      style={{ background: "#F4F6F9", minHeight: "100%" }}
    >
      {/* ── Page Header ──────────────────────────────────── */}
      <motion.div
        custom={0}
        variants={FADE_UP}
        initial="hidden"
        animate="visible"
        className="mb-6 flex items-start justify-between"
      >
        <div>
          <h1 className="page-title">AML Command Overview</h1>
          <p className="page-subtitle flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Last updated: {formatTime(lastUpdated)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button className="btn-secondary" onClick={() => setIsExportModalOpen(true)}>
            <FileText className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* ── KPI Metric Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Active Alerts",
            value: metricsData?.active_alerts ?? 0,
            icon: ShieldAlert,
            color: "#DC2626",
            description: "Require immediate review",
            href: "/alerts"
          },
          {
            label: "Transactions Analyzed",
            value: metricsData?.transactions_scored ?? 0,
            icon: Activity,
            color: "#1A56DB",
            description: "Last 24 hours",
            href: "/temporal"
          },
          {
            label: "Graph Nodes",
            value: metricsData?.graph_nodes ?? 0,
            icon: Network,
            color: "#7C3AED",
            description: "Active entity connections",
            href: "/tgnn"
          },
          {
            label: "Avg Scoring Latency",
            value: metricsData?.avg_tgnn_latency_ms ?? 0,
            suffix: "ms",
            icon: Crosshair,
            color: "#16A34A",
            description: "TGNN pipeline",
            href: null
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            custom={i + 1}
            variants={FADE_UP}
            initial="hidden"
            animate="visible"
          >
            {card.href ? (
              <Link href={card.href} className="block transition-transform hover:-translate-y-1">
                <MetricCard {...card} />
              </Link>
            ) : (
              <MetricCard {...card} />
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* ── Left column: Charts ──────────────────────── */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Transaction Volume Chart */}
          <motion.div custom={5} variants={FADE_UP} initial="hidden" animate="visible">
            <SurfaceCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" style={{ color: "#1A56DB" }} />
                  <h2
                    className="font-semibold"
                    style={{ fontSize: "14px", color: "#0F172A" }}
                  >
                    24h Transaction Volume vs Anomalies
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block rounded-full"
                      style={{ width: "8px", height: "8px", background: "#1A56DB" }}
                    />
                    <span style={{ fontSize: "11px", color: "#64748B" }}>Baseline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block rounded-full"
                      style={{ width: "8px", height: "8px", background: "#DC2626" }}
                    />
                    <span style={{ fontSize: "11px", color: "#64748B" }}>Anomalous</span>
                  </div>
                </div>
              </div>
              <div style={{ height: "220px" }}>
                <TransactionVolumeChart data={volumeData} height={220} />
              </div>
            </SurfaceCard>
          </motion.div>

          {/* Alert Queue */}
          <motion.div custom={6} variants={FADE_UP} initial="hidden" animate="visible">
            <SurfaceCard className="overflow-hidden">
              {/* Card header */}
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom: "1px solid #F1F5F9" }}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" style={{ color: "#DC2626" }} />
                  <h2
                    className="font-semibold"
                    style={{ fontSize: "14px", color: "#0F172A" }}
                  >
                    Recent Alerts
                  </h2>
                  {recentAlerts.length > 0 && (
                    <span
                      className="inline-flex items-center justify-center rounded-full text-white font-bold"
                      style={{
                        width: "18px",
                        height: "18px",
                        background: "#DC2626",
                        fontSize: "10px",
                      }}
                    >
                      {recentAlerts.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Live pulse */}
                  <span
                    className="inline-block rounded-full"
                    style={{
                      width: "6px",
                      height: "6px",
                      background: "#16A34A",
                      animation: "pulse-dot 2s ease-in-out infinite",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748B" }}>Live</span>
                </div>
              </div>

              {/* Alert rows */}
              <div className="overflow-hidden">
                {recentAlerts.length === 0 ? (
                  <div
                    className="flex items-center justify-center py-12"
                    style={{ color: "#94A3B8", fontSize: "13px" }}
                  >
                    No active alerts
                  </div>
                ) : (
                  recentAlerts.map((alert, i) => {
                    const severityKey = String(alert.severity).toLowerCase();
                    const barColors: Record<string, string> = {
                      critical: "#DC2626",
                      high: "#D97706",
                      medium: "#CA8A04",
                      low: "#16A34A",
                    };
                    const barColor = barColors[severityKey] ?? "#94A3B8";

                    return (
                      <Link key={alert.id} href="/alerts" className="block">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-4 px-5 cursor-pointer"
                          style={{
                            borderBottom: "1px solid #F8FAFC",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = "#F8FAFC";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          {/* Priority bar */}
                          <div
                            style={{
                              width: "3px",
                              height: "36px",
                              borderRadius: "2px",
                              background: barColor,
                              flexShrink: 0,
                            }}
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span
                                className="font-medium truncate"
                                style={{ fontSize: "12px", color: "#0F172A" }}
                              >
                                {alert.type.replace(/_/g, " ")}
                              </span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#94A3B8",
                                  flexShrink: 0,
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {alert.time}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <RiskBadge level={alert.severity} />
                              <span
                                className="font-semibold"
                                style={{
                                  fontSize: "12px",
                                  color: "#334155",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {alert.amount}
                              </span>
                            </div>
                          </div>

                          <ChevronRight
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: "#CBD5E1" }}
                          />
                        </motion.div>
                      </Link>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: "1px solid #F1F5F9" }}
              >
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                  Showing {recentAlerts.length} most recent
                </span>
                <a
                  href="/alerts"
                  className="flex items-center gap-1 font-medium"
                  style={{ fontSize: "12px", color: "#1A56DB", textDecoration: "none" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.textDecoration = "underline")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.textDecoration = "none")}
                >
                  View all alerts <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </SurfaceCard>
          </motion.div>
        </div>

        {/* ── Right column: Radar + System Health + Actions ── */}
        <div className="flex flex-col gap-4">


          {/* System Health */}
          <motion.div custom={8} variants={FADE_UP} initial="hidden" animate="visible">
            <SurfaceCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="font-semibold"
                  style={{ fontSize: "14px", color: "#0F172A" }}
                >
                  System Health
                </h2>
                {healthData && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-semibold"
                    style={{
                      fontSize: "11px",
                      background:
                        healthData.overall === "healthy"
                          ? "#DCFCE7"
                          : healthData.overall === "degraded"
                          ? "#FEF3C7"
                          : "#FEE2E2",
                      color:
                        healthData.overall === "healthy"
                          ? "#15803D"
                          : healthData.overall === "degraded"
                          ? "#92400E"
                          : "#DC2626",
                      border: `1px solid ${
                        healthData.overall === "healthy"
                          ? "#BBF7D0"
                          : healthData.overall === "degraded"
                          ? "#FDE68A"
                          : "#FECACA"
                      }`,
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "currentColor",
                        display: "inline-block",
                      }}
                    />
                    {healthData.overall.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {healthData ? (
                  healthData.services.map((svc) => (
                    <div key={svc.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {serviceIcon(svc.status)}
                          <span style={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>
                            {svc.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color:
                              svc.status === "online"
                                ? "#16A34A"
                                : svc.status === "degraded"
                                ? "#D97706"
                                : "#DC2626",
                          }}
                        >
                          {svc.status === "online"
                            ? "Online"
                            : svc.status === "degraded"
                            ? "Degraded"
                            : "Offline"}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="rounded-full overflow-hidden"
                        style={{ height: "4px", background: "#F1F5F9" }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width:
                              svc.status === "online"
                                ? "100%"
                                : svc.status === "degraded"
                                ? "55%"
                                : "0%",
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{
                            background:
                              svc.status === "online"
                                ? "#16A34A"
                                : svc.status === "degraded"
                                ? "#D97706"
                                : "#DC2626",
                          }}
                        />
                      </div>

                      {svc.details && (
                        <p style={{ fontSize: "10px", color: "#94A3B8", marginTop: "2px" }}>
                          {svc.details}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "13px", color: "#94A3B8", textAlign: "center", padding: "16px 0" }}>
                    Fetching system status...
                  </div>
                )}
              </div>
            </SurfaceCard>
          </motion.div>


        </div>
      </div>
      <ExportReportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        metrics={{
          activeAlerts: metricsData?.active_alerts ?? 0,
          analyzed: metricsData?.transactions_scored ?? 0,
          nodes: metricsData?.graph_nodes ?? 0,
          latency: metricsData?.avg_tgnn_latency_ms ?? 0
        }} 
      />
    </div>
  );
}
