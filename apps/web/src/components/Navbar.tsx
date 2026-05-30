"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, TreePine } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Intelligence", href: "#intelligence" },
  { label: "Graph", href: "#graph" },
  { label: "ML Engine", href: "#isolation-forest" },
  { label: "AI Copilot", href: "#ai-copilot" },
  { label: "Architecture", href: "#architecture" },
  { label: "Command Center", href: "#command-center" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-[#E2E8F0]"
          : "bg-transparent"
      }`}
    >
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#1E40AF]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)" }}
            >
              <Shield className="w-4.5 h-4.5 text-white font-bold" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#059669]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-[0.15em] text-[#0F172A] leading-none">
              STAR
            </span>
            <span className="text-[8px] font-mono text-[#64748B] tracking-[0.25em] leading-none mt-0.5">
              INTELLIGENCE
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative px-3 py-2 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors duration-200 group font-medium tracking-wide"
            >
              {link.label === "ML Engine" && (
                <TreePine className="inline-block w-2.5 h-2.5 mr-1 text-[#4F46E5] -mt-0.5" />
              )}
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-[#1E40AF] to-[#4F46E5] group-hover:w-4/5 transition-all duration-200" />
            </a>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#architecture"
            className="px-3 py-2 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors font-medium"
          >
            Docs
          </a>
          <Link
            href="/dashboard"
            className="relative px-5 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 group"
            style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#FFFFFF" }}
          >
            <span className="relative z-10">Launch Platform</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[#64748B] hover:text-[#0F172A] transition-colors p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.98)",
              borderTop: "1px solid #E2E8F0",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 text-sm text-[#64748B] hover:text-[#1E40AF] transition-colors font-medium rounded-lg hover:bg-[#F8FAFC]"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/dashboard"
                className="mt-3 px-5 py-3 text-sm font-semibold rounded-lg text-center block"
                style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#FFFFFF" }}
                onClick={() => setMobileOpen(false)}
              >
                Launch Platform
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
