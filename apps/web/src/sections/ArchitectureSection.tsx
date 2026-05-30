"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useCallback } from "react";
import { Server, Database, Brain, Cpu, Wifi, Bot } from "lucide-react";
import { ARCHITECTURE_LAYERS, TECH_STACK } from "@/lib/constants";

function ArchitectureDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

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
    timeRef.current += 0.01;
    const time = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    const layers = ARCHITECTURE_LAYERS;
    const layerHeight = (h - 100) / layers.length;
    const layerWidth = w * 0.75;
    const startX = (w - layerWidth) / 2;

    layers.forEach((layer, i) => {
      const y = 40 + i * layerHeight;

      // Connection lines between layers
      if (i < layers.length - 1) {
        const nextY = 40 + (i + 1) * layerHeight;
        const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;

        // Data flow particles
        for (let p = 0; p < 3; p++) {
          const progress = ((time * 0.5 + p * 0.33 + i * 0.2) % 1);
          const px = startX + layerWidth * (0.3 + p * 0.2);
          const py = y + layerHeight * 0.8 + (nextY - y - layerHeight * 0.3) * progress;

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = `${layer.color}${Math.floor(pulse * 200).toString(16).padStart(2, "0")}`;
          ctx.fill();
        }

        // Connection line
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(w / 2, y + layerHeight * 0.8);
        ctx.lineTo(w / 2, nextY + 10);
        ctx.strokeStyle = `${layer.color}30`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Layer background
      const grad = ctx.createLinearGradient(startX, y, startX + layerWidth, y);
      grad.addColorStop(0, `${layer.color}08`);
      grad.addColorStop(0.5, `${layer.color}05`);
      grad.addColorStop(1, `${layer.color}08`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(startX, y + 10, layerWidth, layerHeight * 0.7, 12);
      ctx.fill();

      // Layer border
      ctx.strokeStyle = `${layer.color}20`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(startX, y + 10, layerWidth, layerHeight * 0.7, 12);
      ctx.stroke();

      // Layer label
      ctx.font = 'bold 13px "Inter", sans-serif';
      ctx.fillStyle = layer.color;
      ctx.textAlign = "left";
      ctx.fillText(layer.name, startX + 16, y + 32);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = "#64748B";
      ctx.fillText(layer.tech, startX + 16, y + 48);

      // Items
      const itemWidth = (layerWidth - 48) / layer.items.length;
      layer.items.forEach((item, j) => {
        const ix = startX + 16 + j * itemWidth;
        const iy = y + 56;

        ctx.fillStyle = `${layer.color}10`;
        ctx.beginPath();
        ctx.roundRect(ix, iy, itemWidth - 8, 22, 6);
        ctx.fill();

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = `${layer.color}CC`;
        ctx.textAlign = "center";
        ctx.fillText(item, ix + (itemWidth - 8) / 2, iy + 14);
      });
    });

  }, []);

  useEffect(() => {
    const animate = () => {
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[550px]"
    />
  );
}

export default function ArchitectureSection() {
  const techIcons: Record<string, typeof Server> = {
    Database: Database,
    Backend: Server,
    "ML Model": Brain,
    "Anomaly Detection": Cpu,
    "Real-time": Wifi,
    "AI Agent": Bot,
    Frontend: Server,
    "GNN Framework": Brain,
  };

  return (
    <section id="architecture" className="section-shell">
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
            <Server className="w-3 h-3 text-[#0891B2]" />
            <span style={{ color: "#0891B2" }}>
              SYSTEM ARCHITECTURE
            </span>
          </div>
          <h2 className="section-title mb-4">
            <span>Built for </span>
            <span className="gradient-text">Scale</span>
          </h2>
          <p className="section-copy mx-auto">
            Production-grade architecture designed for real-time financial intelligence.
            Every layer optimized for sub-second detection and graph-native analytics.
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="surface-card rounded-xl p-6 mb-12"
        >
          <ArchitectureDiagram />
        </motion.div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TECH_STACK.map((tech, i) => {
            const Icon = techIcons[tech.category] || Server;
            return (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="surface-card rounded-xl p-4 hover:bg-[#F8FAFC] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center group-hover:bg-[#0891B2]/10 transition-colors">
                    <Icon className="w-5 h-5 text-[#64748B] group-hover:text-[#0891B2] transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0F172A]">{tech.name}</div>
                    <div className="text-[10px] font-mono text-[#64748B] uppercase">
                      {tech.category}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
