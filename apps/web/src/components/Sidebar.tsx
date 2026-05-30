"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
  Layers,
  Settings,
  Hexagon
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

const SIDEBAR_LINKS = [
  { label: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { label: "Realtime Stream", href: "/realtime", icon: Activity },
  { label: "Graph Intelligence", href: "/graph", icon: Network },
  { label: "Alert Center", href: "/alerts", icon: ShieldAlert },
  { label: "Risk Engine", href: "/risk", icon: Search },
  { label: "Communities", href: "/communities", icon: Users },
  { label: "Temporal Analytics", href: "/temporal", icon: Clock },
  { label: "AI Copilot", href: "/copilot", icon: Bot },
  { label: "Investigations", href: "/investigations", icon: Briefcase },
  { label: "Architecture", href: "/#architecture", icon: Layers }, // Link back to landing
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: sidebarOpen ? 260 : 80 }}
      className="h-screen sticky top-0 left-0 bg-white/95 backdrop-blur-md border-r border-[#E2E8F0] flex flex-col z-50 overflow-hidden shadow-[0_0_24px_rgba(15,23,42,0.03)]"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0] shrink-0 bg-white/70">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center border border-[#1E40AF]/20">
            <Hexagon className="w-5 h-5 text-[#1E40AF]" />
          </div>
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-lg tracking-widest text-[#0F172A] font-display">
              STAR
            </motion.span>
          )}
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
        {SIDEBAR_LINKS.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link key={link.href} href={link.href}>
              <div
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                  isActive ? "bg-[#1E40AF]/10" : "hover:bg-[#F1F5F9]"
                }`}
              >
                <div className={`flex items-center justify-center w-6 h-6 shrink-0 ${
                  isActive ? "text-[#1E40AF]" : "text-[#64748B] group-hover:text-[#0F172A]"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`ml-3 text-sm font-medium whitespace-nowrap ${
                      isActive ? "text-[#1E40AF]" : "text-[#64748B] group-hover:text-[#0F172A]"
                    }`}
                  >
                    {link.label}
                  </motion.span>
                )}

                {isActive && sidebarOpen && (
                  <motion.div layoutId="active-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1E40AF]" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-[#E2E8F0] shrink-0 bg-white/70">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] transition-colors text-[#64748B]"
        >
          <span className="text-xs font-mono">{sidebarOpen ? "COLLAPSE" : "EXPAND"}</span>
        </button>
      </div>
    </motion.aside>
  );
}
