"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, FileText, Share2, CornerDownRight } from "lucide-react";
import { useInvestigationStore } from "@/store/useInvestigationStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { TerminalText } from "@/components/ui/TerminalText";
import { FADE_IN, FADE_UP } from "@/animations/variants";

export function AICopilot() {
  const { messages, isTyping, simulateAIResponse } = useInvestigationStore();
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    simulateAIResponse(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border border-[#E2E8F0] shadow-sm rounded-2xl overflow-hidden relative">
      {/* Background ambient */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#7C3AED]/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E2E8F0] bg-white z-10">
        <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 flex items-center justify-center border border-[#7C3AED]/20">
          <Bot className="w-4 h-4" style={{ color: "#7C3AED" }} />
        </div>
        <div>
          <h3 className="font-bold text-[#0F172A]">STAR Copilot</h3>
          <p className="text-[10px] text-[#64748B] font-mono">GNN + LLM Investigation Agent</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#10B981" }}></span>
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#10B981" }}></span>
          </span>
          <span className="text-[10px] font-mono tracking-widest" style={{ color: "#10B981" }}>ONLINE</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide z-10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={FADE_UP}
              initial="hidden"
              animate="visible"
              className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 mt-1">
                {msg.role === "assistant" ? (
                  <div className="w-8 h-8 rounded bg-[#7C3AED]/10 flex items-center justify-center border border-[#7C3AED]/20 shadow-sm">
                    <Bot className="w-4 h-4" style={{ color: "#7C3AED" }} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded bg-[#2563EB]/10 flex items-center justify-center border border-[#2563EB]/20">
                    <User className="w-4 h-4" style={{ color: "#2563EB" }} />
                  </div>
                )}
              </div>

              {/* Content Bubble */}
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-[10px] font-mono ${msg.role === "user" ? "flex-row-reverse text-[#2563EB]" : "text-[#7C3AED]"}`}>
                  <span>{msg.role === "assistant" ? "AGENT" : "INVESTIGATOR"}</span>
                  <span className="text-[#64748B]">{msg.timestamp}</span>
                </div>
                
                <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#0F172A] rounded-tr-sm" 
                    : "bg-white border border-[#E2E8F0] shadow-sm text-[#334155] rounded-tl-sm"
                }`}>
                  {/* Markdown-ish rendering for the mock text */}
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={`mb-2 last:mb-0 ${line.startsWith('`') ? 'font-mono text-xs text-[#0F172A] bg-[#F1F5F9] p-2 rounded' : ''}`}>
                      {line.replace(/`/g, '').replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>

                {/* Metadata Attachments (Cypher, Graph) */}
                {msg.metadata && msg.metadata.cypherQuery && (
                  <div className="mt-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg border-l-2" style={{ borderLeftColor: "#2563EB" }}>
                    <div className="flex items-center gap-2 mb-2 text-[#64748B]">
                      <TerminalText className="text-[10px]">EXECUTED_CYPHER_QUERY</TerminalText>
                    </div>
                    <code className="text-xs font-mono text-[#0F172A] break-all">
                      {msg.metadata.cypherQuery}
                    </code>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div variants={FADE_IN} initial="hidden" animate="visible" className="flex gap-4 max-w-[85%]">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded bg-[#7C3AED]/10 flex items-center justify-center border border-[#7C3AED]/20">
                <Bot className="w-4 h-4" style={{ color: "#7C3AED" }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white shadow-sm border border-[#E2E8F0] rounded-tl-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "#7C3AED", animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "#7C3AED", animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "#7C3AED", animationDelay: "300ms" }} />
              <span className="ml-2 text-xs font-mono" style={{ color: "#7C3AED" }}>PROCESSING GRAPH...</span>
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[#E2E8F0] z-10">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={isTyping ? "Agent is analyzing..." : "Ask the copilot to investigate an entity or pattern..."}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3 pl-4 pr-12 text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-1.5 rounded-lg transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: input.trim() && !isTyping ? "#7C3AED" : "#F1F5F9",
              color: input.trim() && !isTyping ? "white" : "#94A3B8"
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
