"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Search, Maximize2, Radar, Network } from "lucide-react";
import { GRAPH_NODES, GRAPH_LINKS } from "@/lib/constants";

function InteractiveGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [selectedPath, setSelectedPath] = useState<number>(0);

  const paths = useMemo(() => [
    ["ACC-4521", "ACC-7833", "ACC-9877", "ACC-5590", "ACC-4521"], // circular
    ["ACC-9877", "ACC-1102", "ACC-4521"],                          // 2-hop
    ["ACC-5590", "ACC-7744", "ACC-7833"],                          // branch
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedPath((p) => (p + 1) % paths.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [paths.length]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) / 680;

    timeRef.current += 0.013;
    const time = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    // Node positions
    const nodePositions: Record<string, { x: number; y: number }> = {};
    GRAPH_NODES.forEach((n) => {
      nodePositions[n.id] = {
        x: cx + n.x * scale,
        y: cy + n.y * scale,
      };
    });

    const currentPath = paths[selectedPath];
    const isCircular = selectedPath === 0;

    // Draw links
    GRAPH_LINKS.forEach((link) => {
      const src = nodePositions[link.source];
      const tgt = nodePositions[link.target];
      if (!src || !tgt) return;

      const isInPath = currentPath.some((id, i) => {
        if (i >= currentPath.length - 1) return false;
        return (
          (link.source === currentPath[i] && link.target === currentPath[i + 1]) ||
          (link.target === currentPath[i] && link.source === currentPath[i + 1])
        );
      });

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);

      if (isInPath) {
        const gradient = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
        gradient.addColorStop(0, "rgba(220, 38, 38, 0.7)");
        gradient.addColorStop(0.5, "rgba(234, 88, 12, 0.8)");
        gradient.addColorStop(1, "rgba(220, 38, 38, 0.7)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(220, 38, 38, 0.4)";
        ctx.shadowBlur = 12;
      } else if (link.suspicious) {
        ctx.strokeStyle = "rgba(234, 88, 12, 0.15)";
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = "rgba(30, 64, 175, 0.06)";
        ctx.lineWidth = 0.4;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Flow particles on path
      if (isInPath) {
        const numParticles = isCircular ? 3 : 2;
        for (let p = 0; p < numParticles; p++) {
          const progress = ((time * 0.35 + p * (1 / numParticles)) % 1);
          const px = src.x + (tgt.x - src.x) * progress;
          const py = src.y + (tgt.y - src.y) * progress;

          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(220, 38, 38, 0.9)";
          ctx.shadowColor = "#DC2626";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Trail
          for (let t = 1; t <= 3; t++) {
            const tp = ((time * 0.35 + p * (1 / numParticles) - t * 0.04) % 1);
            if (tp > 0 && tp < 1) {
              const tx = src.x + (tgt.x - src.x) * tp;
              const ty = src.y + (tgt.y - src.y) * tp;
              ctx.beginPath();
              ctx.arc(tx, ty, 2.5 - t * 0.6, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(220, 38, 38, ${0.4 - t * 0.1})`;
              ctx.fill();
            }
          }
        }
      }
    });

    // Draw nodes
    GRAPH_NODES.forEach((node) => {
      const pos = nodePositions[node.id];
      if (!pos) return;

      const isInPath = currentPath.includes(node.id);
      const pulse = Math.sin(time * 2 + node.risk * 0.05) * 0.2 + 0.9;
      const baseRadius = isInPath ? 10 : 4 + (node.risk / 100) * 5;
      const radius = baseRadius * pulse;

      const communityColors = ["#DC2626", "#1E40AF", "#059669"];
      const nodeColor = isInPath ? "#DC2626" : communityColors[node.community] || "#64748B";

      // Glow halo
      if (node.risk > 60 || isInPath) {
        const glowRadius = radius * (isInPath ? 5 : 3.5);
        const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
        grad.addColorStop(0, `${nodeColor}${isInPath ? "30" : "15"}`);
        grad.addColorStop(0.5, `${nodeColor}08`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(pos.x - glowRadius, pos.y - glowRadius, glowRadius * 2, glowRadius * 2);
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isInPath
        ? `rgba(220, 38, 38, ${0.85 * pulse})`
        : node.community === 0
        ? `rgba(30, 64, 175, ${0.7 * pulse})`
        : node.community === 1
        ? `rgba(37, 99, 235, ${0.6 * pulse})`
        : `rgba(5, 150, 105, ${0.5 * pulse})`;

      if (isInPath) {
        ctx.shadowColor = "#DC2626";
        ctx.shadowBlur = 20;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Node border
      if (isInPath) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(220, 38, 38, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Label
      if (radius > 6 || isInPath) {
        ctx.font = `${isInPath ? "bold " : ""}${isInPath ? 11 : 9}px "JetBrains Mono", monospace`;
        ctx.fillStyle = isInPath ? "rgba(15,23,42,0.95)" : "rgba(15,23,42,0.65)";
        ctx.textAlign = "center";
        ctx.fillText(node.name, pos.x, pos.y + radius + 14);
      }
    });

  }, [selectedPath, paths]);

  useEffect(() => {
    const animate = () => {
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const pathLabels = ["Circular Ring (4-hop)", "Multi-hop Trace (2-hop)", "Branch Pattern (2-hop)"];
  const pathColors = ["#DC2626", "#EA580C", "#4F46E5"];

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden"
      style={{
        background: "rgba(248,250,252,0.9)",
        border: "1px solid rgba(226,232,240,0.8)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#1E40AF]" />
          <span className="text-[10px] font-mono text-[#1E40AF] tracking-[0.12em]">
            GRAPH EXPLORER · MULTI-HOP TRACER
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            key={selectedPath}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[9px] font-mono px-2 py-1 rounded-lg font-bold"
            style={{ color: pathColors[selectedPath], backgroundColor: `${pathColors[selectedPath]}10`, border: `1px solid ${pathColors[selectedPath]}20` }}
          >
            {pathLabels[selectedPath]}
          </motion.span>
          <button className="p-1.5 rounded-lg glass hover:bg-[#F1F5F9] transition-colors">
            <Search className="w-3 h-3 text-[#64748B]" />
          </button>
          <button className="p-1.5 rounded-lg glass hover:bg-[#F1F5F9] transition-colors">
            <Maximize2 className="w-3 h-3 text-[#64748B]" />
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[9px] font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#DC2626]" style={{ boxShadow: "0 0 6px rgba(220,38,38,0.4)" }} />
          <span className="text-[#64748B]">Suspicious Cluster</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1E40AF]" style={{ boxShadow: "0 0 6px rgba(30,64,175,0.3)" }} />
          <span className="text-[#64748B]">Monitored</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#059669]" />
          <span className="text-[#64748B]">Legitimate</span>
        </div>
      </div>

      {/* Path info */}
      <motion.div
        key={selectedPath}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 right-4 glass rounded-xl px-3 py-2"
      >
        <span className="text-[9px] font-mono" style={{ color: pathColors[selectedPath] }}>
          PATH {selectedPath + 1}/{paths.length} · {paths[selectedPath].length - 1} HOPS
        </span>
      </motion.div>
    </div>
  );
}

// ─── Main GraphSection ────────────────────────────────────────────────────────
export default function GraphSection() {
  const ref = useRef(null);

  const capabilities = [
    {
      title: "Multi-hop Tracing",
      desc: "Follow money through N intermediaries. Reconstruct the complete laundering chain with weighted path analysis and Cypher queries.",
      color: "#1E40AF",
      icon: "→",
    },
    {
      title: "Circular Detection",
      desc: "Detect money loops: A→B→C→A. The smoking gun of round-tripping laundering, found automatically by cycle detection algorithms.",
      color: "#DC2626",
      icon: "↺",
    },
    {
      title: "Community Detection",
      desc: "Louvain algorithm reveals tightly-knit clusters — potential mule rings and shell company networks hiding in plain sight.",
      color: "#4F46E5",
      icon: "◎",
    },
    {
      title: "Risk Propagation",
      desc: "PageRank-based risk spreading through the network. One suspicious node raises the risk of all its neighbors.",
      color: "#EA580C",
      icon: "⟨⟩",
    },
    {
      title: "GNN Classification",
      desc: "GraphSAGE neural network learns suspicious patterns from topology. P(fraud) = 0.91 for ACC-4521's transaction cluster.",
      color: "#0D9488",
      icon: "∿",
    },
  ];

  return (
    <section id="graph" className="section-shell" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#FFFFFF] to-[#F8FAFC]" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="section-eyebrow mb-6">
            <Radar className="w-3 h-3 text-[#4F46E5]" />
            <span style={{ color: "#4F46E5" }}>
              GRAPH INTELLIGENCE ENGINE
            </span>
          </div>
          <h2 className="section-title mb-4">
            <span>See What Legacy </span>
            <br className="hidden md:block" />
            <span className="gradient-text">Systems Miss</span>
          </h2>
          <p className="section-copy mx-auto">
            Graph-native intelligence reveals hidden connections that flat-table AML systems
            simply cannot detect. Multi-hop paths, circular patterns, and community
            structures — visible in seconds.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Graph visualization */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <InteractiveGraph />
            </motion.div>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group p-4 rounded-xl cursor-pointer transition-all duration-300 surface-card"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: `1px solid ${cap.color}15`,
                  borderLeft: `2px solid ${cap.color}60`,
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = `${cap.color}06`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${cap.color}30`;
                  (e.currentTarget as HTMLElement).style.borderLeftColor = cap.color;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(248,250,252,0.9)";
                  (e.currentTarget as HTMLElement).style.borderColor = `${cap.color}15`;
                  (e.currentTarget as HTMLElement).style.borderLeftColor = `${cap.color}60`;
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base font-bold" style={{ color: cap.color }}>{cap.icon}</span>
                  <h4 className="text-sm font-semibold" style={{ color: cap.color }}>
                    {cap.title}
                  </h4>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed group-hover:text-[#0F172A] transition-colors">
                  {cap.desc}
                </p>
              </motion.div>
            ))}

            {/* Neo4j badge */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="surface-card p-3 rounded-xl text-center"
              style={{ background: "rgba(13,148,136,0.05)", border: "1px solid rgba(13,148,136,0.12)" }}
            >
              <div className="text-[10px] font-mono text-[#0D9488] mb-1">POWERED BY</div>
              <div className="text-sm font-bold text-[#0F172A]">Neo4j · GraphSAGE · Louvain</div>
              <div className="text-[9px] font-mono text-[#64748B] mt-0.5">Native graph database · GNN · Community detection</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
