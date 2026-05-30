"use client";

import { motion } from "framer-motion";
import {
  Zap,
  GitBranch,
  Brain,
  MessageSquare,
  FileText,
  Users,
  Radio,
  Clock,
  Activity,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";
import TiltCard from "@/components/TiltCard";

const iconMap: Record<string, React.ElementType> = {
  Zap,
  GitBranch,
  Brain,
  MessageSquare,
  FileText,
  Users,
  Radio,
  Clock,
  Activity,
};

export default function FeaturesSection() {
  return (
    <section id="features" className="section-shell">
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
            <Zap className="w-3 h-3 text-[#D97706]" />
            <span style={{ color: "#D97706" }}>
              CAPABILITIES
            </span>
          </div>
          <h2 className="section-title mb-4">
            <span>Every Tool for </span>
            <span className="gradient-text">Modern AML</span>
          </h2>
          <p className="section-copy mx-auto">
            A comprehensive suite of graph-native intelligence tools. From real-time streaming
            detection to AI-powered investigation — everything you need to stop financial crime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = iconMap[feature.icon] || Zap;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <TiltCard
                  className="group relative rounded-xl p-6 cursor-pointer transition-all duration-300 h-full overflow-hidden surface-card"
                >
                  {/* Base bg */}
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      border: `1px solid ${feature.color}12`,
                      backdropFilter: "blur(20px)",
                    }}
                  />

                  {/* Top gradient line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${feature.color}60, transparent)`,
                    }}
                  />

                  {/* Corner accent */}
                  <div
                    className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 100% 0%, ${feature.color}10, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${feature.color}10`,
                        border: `1px solid ${feature.color}20`,
                      }}
                    >
                      <Icon
                        className="w-5 h-5 transition-colors duration-300"
                        style={{ color: feature.color }}
                      />
                    </div>

                    <h3 className="text-base font-semibold text-[#0F172A] mb-2 group-hover:text-[#1E40AF] transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-[#475569] leading-relaxed group-hover:text-[#0F172A] transition-colors">
                      {feature.description}
                    </p>

                    {/* Bottom accent */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                      style={{ background: `linear-gradient(90deg, ${feature.color}40, transparent)` }}
                    />
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
