"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Shield,
  TrendingUp,
  Zap,
  Clock,
  Activity,
  Radio,
} from "lucide-react";
import { MOCK_TRANSACTIONS, MOCK_ALERTS } from "@/lib/constants";
import TiltCard from "@/components/TiltCard";

// ─── Transaction Feed ─────────────────────────────────────────────────────────
function TransactionFeed() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS.slice(0, 5));
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions((prev) => {
        const nextIndex = (MOCK_TRANSACTIONS.indexOf(prev[0]) + 1) % MOCK_TRANSACTIONS.length;
        const newTx = MOCK_TRANSACTIONS[nextIndex];
        return [newTx, ...prev.slice(0, 4)];
      });
      setKey((k) => k + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const riskColor = (risk: string) => {
    switch (risk) {
      case "critical": return "#DC2626";
      case "high": return "#EA580C";
      case "medium": return "#D97706";
      default: return "#059669";
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 h-full" style={{ border: "1px solid rgba(30,64,175,0.1)" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#1E40AF]" />
          <h3 className="text-xs font-mono font-semibold text-[#1E40AF] tracking-[0.12em]">
            LIVE TRANSACTION FEED
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
          </span>
          <span className="text-[10px] font-mono text-[#059669]">STREAMING</span>
        </div>
      </div>

      <div className="space-y-2">
        {transactions.map((tx, i) => (
          <motion.div
            key={`${tx.id}-${key}-${i}`}
            initial={i === 0 ? { opacity: 0, y: -20, scale: 0.97 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between p-3 rounded-xl transition-colors cursor-default group"
            style={{
              background: "rgba(248,250,252,0.8)",
              border: "1px solid rgba(226,232,240,0.8)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(241,245,249,0.9)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(248,250,252,0.8)";
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: riskColor(tx.risk),
                  boxShadow: `0 0 6px ${riskColor(tx.risk)}40`,
                }}
              />
              <div>
                <div className="text-xs font-mono text-[#0F172A]">
                  {tx.from} <span className="text-[#64748B]">→</span> {tx.to}
                </div>
                <div className="text-[9px] font-mono text-[#64748B] mt-0.5">
                  {tx.timestamp} · {tx.type.replace("_", " ").toUpperCase()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-semibold text-[#0F172A]">
                ${tx.amount.toLocaleString("en-US")}
              </div>
              {tx.flag && (
                <div
                  className="text-[8px] font-mono px-1.5 py-0.5 rounded mt-0.5 font-medium"
                  style={{
                    backgroundColor: `${riskColor(tx.risk)}12`,
                    color: riskColor(tx.risk),
                    border: `1px solid ${riskColor(tx.risk)}20`,
                  }}
                >
                  {tx.flag}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* TPS indicator */}
      <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(226,232,240,0.8)" }}>
        <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B]">
          <span>THROUGHPUT</span>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#1E40AF]"
          >
            2,847 TXN/SEC
          </motion.span>
        </div>
        <div className="mt-1.5 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
          <motion.div
            animate={{ width: ["60%", "85%", "70%", "92%", "75%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #1E40AF, #2563EB)" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Alert Cards ──────────────────────────────────────────────────────────────
function AlertCards() {
  return (
    <div className="glass-card rounded-xl p-6 h-full" style={{ border: "1px solid rgba(220,38,38,0.1)" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          <h3 className="text-xs font-mono font-semibold text-[#DC2626] tracking-[0.12em]">
            ACTIVE ALERTS
          </h3>
        </div>
        <motion.span
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
          style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}
        >
          {MOCK_ALERTS.length} OPEN
        </motion.span>
      </div>

      <div className="space-y-3">
        {MOCK_ALERTS.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            className="group p-3 rounded-xl transition-all cursor-pointer relative overflow-hidden"
            style={{
              background: "rgba(248,250,252,0.8)",
              border: `1px solid ${
                alert.severity === "critical"
                  ? "rgba(220,38,38,0.1)"
                  : alert.severity === "high"
                  ? "rgba(234,88,12,0.1)"
                  : "rgba(217,119,6,0.1)"
              }`,
            }}
          >
            {/* Side accent */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
              style={{
                background:
                  alert.severity === "critical"
                    ? "#DC2626"
                    : alert.severity === "high"
                    ? "#EA580C"
                    : "#D97706",
              }}
            />

            <div className="flex items-start justify-between pl-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{
                      backgroundColor:
                        alert.severity === "critical"
                          ? "rgba(220,38,38,0.1)"
                          : alert.severity === "high"
                          ? "rgba(234,88,12,0.1)"
                          : "rgba(217,119,6,0.1)",
                      color:
                        alert.severity === "critical"
                          ? "#DC2626"
                          : alert.severity === "high"
                          ? "#EA580C"
                          : "#D97706",
                    }}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[9px] font-mono text-[#64748B]">{alert.id}</span>
                </div>
                <div className="text-sm text-[#0F172A] font-medium">{alert.type}</div>
                <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-[#64748B]">
                  <span>{alert.entities} entities</span>
                  <span className="text-[#CBD5E1]">·</span>
                  <span>{alert.amount}</span>
                  <span className="text-[#CBD5E1]">·</span>
                  <span>{alert.time}</span>
                </div>
              </div>
              <div className="flex flex-col items-end ml-3">
                <div className="text-xl font-bold font-mono"
                  style={{
                    color: alert.score > 85 ? "#DC2626" : alert.score > 70 ? "#EA580C" : "#D97706",
                  }}>
                  {alert.score}
                </div>
                <div className="text-[8px] text-[#64748B] font-mono">RISK</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Intel Stats ──────────────────────────────────────────────────────────────
function IntelStats() {
  const stats = [
    { label: "Monitored Accounts", value: "847K", icon: Shield, color: "#1E40AF" },
    { label: "Critical Alerts", value: "23", icon: AlertTriangle, color: "#DC2626" },
    { label: "Under Investigation", value: "12", icon: TrendingUp, color: "#EA580C" },
    { label: "SAR Filed (MTD)", value: "8", icon: ArrowUpRight, color: "#4F46E5" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
          >
            <TiltCard
              className="glass-card rounded-xl p-5 group transition-all h-full w-full hover-glow-cyan"
              glowColor={`${stat.color}10`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}10` }}
                >
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-[#0F172A]">
                {stat.value}
              </div>
              <div className="mt-2 h-px" style={{ background: `linear-gradient(90deg, ${stat.color}20, transparent)` }} />
            </TiltCard>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Temporal Anomaly Panel ───────────────────────────────────────────────────
function TemporalAnomalyPanel() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const transactionVolume = [
    12, 8, 5, 4, 3, 7, 18, 45, 72, 89, 94, 87,
    91, 85, 78, 82, 95, 112, 108, 94, 76, 58, 38, 22,
  ];
  // Night hours (22-6) with suspicious burst
  const anomalyHours = [0, 1, 2, 3, 22, 23];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-xl p-6 col-span-full"
      style={{ border: "1px solid rgba(217,119,6,0.1)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D97706]" />
          <h3 className="text-xs font-mono font-semibold text-[#D97706] tracking-[0.12em]">
            TEMPORAL ANOMALY DETECTION · EWMA BASELINES
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: "rgba(30,64,175,0.5)" }} />
            <span className="text-[#64748B]">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-[#DC2626]" />
            <span className="text-[#64748B]">Anomalous</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-[#D97706]" />
            <span className="text-[#64748B]">Night Activity</span>
          </div>
        </div>
      </div>

      {/* Hour chart */}
      <div className="flex items-end gap-1 h-20">
        {hours.map((h) => {
          const vol = transactionVolume[h];
          const isNight = h >= 22 || h <= 5;
          const isBurst = isNight && vol > 10;
          const maxVol = Math.max(...transactionVolume);

          return (
            <motion.div
              key={h}
              initial={{ height: 0 }}
              whileInView={{ height: `${(vol / maxVol) * 100}%` }}
              transition={{ delay: h * 0.025, duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex-1 rounded-t relative group cursor-default"
              style={{
                backgroundColor: isBurst
                  ? "rgba(220,38,38,0.6)"
                  : isNight
                  ? "rgba(217,119,6,0.4)"
                  : `rgba(30,64,175,${0.15 + (vol / maxVol) * 0.35})`,
                boxShadow: isBurst ? "0 0 8px rgba(220,38,38,0.4)" : undefined,
              }}
              title={`${String(h).padStart(2, "0")}:00 — ${vol} TXN`}
            >
              {isBurst && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#DC2626]"
                  style={{ boxShadow: "0 0 6px #DC2626" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Hour labels */}
      <div className="flex mt-1.5">
        {[0, 4, 8, 12, 16, 20, 23].map((h) => (
          <div
            key={h}
            className="text-[8px] font-mono text-[#64748B]"
            style={{ marginLeft: `${(h / 23) * 96}%` }}
          >
            {String(h).padStart(2, "0")}h
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[9px] font-mono">
        <Radio className="w-3 h-3 text-[#DC2626] animate-pulse" />
        <span className="text-[#DC2626]">TEMPORAL ANOMALY: 3 accounts show unusual night-hour activity (22:00–04:00) · night_ratio = 0.82 · EWMA baseline exceeded 4.2σ</span>
      </div>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function IntelligenceSection() {
  const ref = useRef(null);
  useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="intelligence" className="section-shell" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#FFFFFF] to-[#F8FAFC]" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="section-eyebrow mb-6">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#1E40AF]"
              style={{ boxShadow: "0 0 8px rgba(30,64,175,0.3)" }}
            />
            <span style={{ color: "#1E40AF" }}>
              REAL-TIME INTELLIGENCE
            </span>
          </div>
          <h2 className="section-title mb-4">
            <span>Live AML </span>
            <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="section-copy mx-auto">
            Every transaction analyzed in real-time. Suspicious patterns detected
            and surfaced instantly. No batch processing. No delays. Sub-50ms scoring.
          </p>
        </motion.div>

        {/* Stats */}
        <IntelStats />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          <TransactionFeed />
          <AlertCards />
        </div>

        {/* Temporal panel */}
        <div className="grid grid-cols-1">
          <TemporalAnomalyPanel />
        </div>
      </div>
    </section>
  );
}
