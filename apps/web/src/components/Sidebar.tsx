"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  Network,
  ShieldAlert,
  Search,
  Users,
  Clock,
  Bot,
  Briefcase,
  Settings,
  Shield,
  Brain,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

// Navigation groups — structured for compliance workflow
const NAV_GROUPS = [
  {
    label: "Monitor",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Alert Queue", href: "/alerts", icon: ShieldAlert },
      { label: "Realtime Feed", href: "/realtime", icon: Activity },
    ],
  },
  {
    label: "Investigate",
    items: [
      { label: "Entity Search", href: "/risk", icon: Search },
      { label: "Investigations", href: "/investigations", icon: Briefcase },
      { label: "Communities", href: "/communities", icon: Users },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", href: "/temporal", icon: Clock },
      { label: "Graph Network", href: "/tgnn", icon: Brain },
      { label: "AI Copilot", href: "/copilot", icon: Bot },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const isActive = (href: string) => pathname === href;

  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen flex flex-col z-50 flex-shrink-0 overflow-hidden"
      style={{ background: "#1E2A3A" }}
    >
      {/* ── Logo & Hamburger ─────────────────────────────── */}
      <div
        className="h-14 flex items-center justify-between px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {/* Logo mark */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#1A56DB" }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>

          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                key="logo-text"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div
                  className="text-sm font-bold tracking-wider leading-tight"
                  style={{ color: "#FFFFFF" }}
                >
                  STAR
                </div>
                <div
                  className="text-[10px] tracking-widest leading-tight"
                  style={{ color: "#64748B" }}
                >
                  AML SYSTEM
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Hamburger toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors flex-shrink-0"
          style={{ color: "#64748B" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "#CBD5E1";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#64748B";
          }}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-3" : ""}>
            {/* Section label */}
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.div
                  key={`label-${group.label}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-4 mb-1"
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#4A5568",
                  }}
                >
                  {group.label}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed: show section divider */}
            {!sidebarOpen && gi > 0 && (
              <div
                className="mx-3 mb-2 mt-1"
                style={{ height: "1px", background: "rgba(255,255,255,0.06)" }}
              />
            )}

            {/* Nav items */}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} style={{ display: "block" }}>
                  <div
                    className="mx-2 mb-0.5 flex items-center gap-3 rounded-md transition-all"
                    style={{
                      padding: sidebarOpen ? "7px 10px" : "8px",
                      justifyContent: sidebarOpen ? "flex-start" : "center",
                      background: active ? "#2D3F55" : "transparent",
                      color: active ? "#FFFFFF" : "#94A3B8",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "#243447";
                        (e.currentTarget as HTMLElement).style.color = "#CBD5E1";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                      }
                    }}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    {/* Active accent bar */}
                    {active && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "6px",
                          bottom: "6px",
                          width: "3px",
                          background: "#1A56DB",
                          borderRadius: "0 2px 2px 0",
                        }}
                      />
                    )}

                    <Icon
                      className="flex-shrink-0"
                      style={{
                        width: "16px",
                        height: "16px",
                        color: active ? "#FFFFFF" : "inherit",
                      }}
                    />

                    <AnimatePresence mode="wait">
                      {sidebarOpen && (
                        <motion.span
                          key={`label-${item.href}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          style={{
                            fontSize: "13px",
                            fontWeight: active ? 600 : 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User Profile ─────────────────────────────────── */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="flex items-center gap-3 rounded-md p-2 cursor-pointer transition-colors"
          style={{ color: "#94A3B8" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: "#1A56DB", color: "#FFFFFF" }}
          >
            A4
          </div>

          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex-1 min-w-0"
              >
                <div
                  className="text-xs font-semibold truncate"
                  style={{ color: "#CBD5E1" }}
                >
                  Analyst_04
                </div>
                <div className="text-[10px] truncate" style={{ color: "#4A5568" }}>
                  AML Compliance
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                key="logout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4A5568" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
