// ============================================================
// STAR — Investigation Store
// State management for AI Copilot and Case Management
// ============================================================
import { create } from "zustand";
import type { AIMessage, Investigation, SARReport } from "@/types";
import { AI_MESSAGES, MOCK_SAR } from "@/data";

// ── Regex to extract account/entity IDs from user messages ────
// Matches: ACC-1234, ENTITY-001, TX-0042, TX_0042, Entity_0035, etc.
const ACCOUNT_ID_RE = /\b([A-Z]{2,}[-_]\d{3,})\b/gi;

function extractEntityIds(text: string): string[] {
  const matches = text.match(ACCOUNT_ID_RE) ?? [];
  return [...new Set(matches.map((m) => m.toUpperCase()))];
}

interface InvestigationState {
  // Current Investigation
  activeInvestigationId: string | null;
  messages: AIMessage[];
  isTyping: boolean;

  // SAR Generation
  activeSarDraft: SARReport | null;
  isGeneratingSar: boolean;

  // Actions
  setActiveInvestigation: (id: string | null) => void;
  addMessage: (message: AIMessage) => void;
  setTyping: (isTyping: boolean) => void;
  setActiveSar: (sar: SARReport | null) => void;
  setGeneratingSar: (isGenerating: boolean) => void;

  // AI Simulator Action
  simulateAIResponse: (userMessage: string) => Promise<void>;
}

export const useInvestigationStore = create<InvestigationState>((set, get) => ({
  activeInvestigationId: "INV-2024-089",
  messages: [],
  isTyping: false,

  activeSarDraft: null,
  isGeneratingSar: false,

  setActiveInvestigation: (id) => set({ activeInvestigationId: id }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setTyping: (isTyping) => set({ isTyping }),
  setActiveSar: (sar) => set({ activeSarDraft: sar }),
  setGeneratingSar: (isGenerating) => set({ isGeneratingSar: isGenerating }),

  simulateAIResponse: async (userMessage) => {
    const { addMessage, setTyping, setActiveSar, setGeneratingSar } = get();

    // 1. Add user message immediately
    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    addMessage(userMsg);
    setTyping(true);

    try {
      const { starApi } = await import('@/lib/api');

      // 2. Extract any account / entity IDs mentioned in the message
      const entityIds = extractEntityIds(userMessage);
      const primaryId = entityIds[0] ?? null; // first match is the "subject"

      // 3. Build rich context to inject into the LLM prompt
      const context: Record<string, unknown> = {};
      if (entityIds.length > 0) {
        context["mentioned_entities"] = entityIds.join(", ");
        context["primary_subject"] = primaryId;
      }

      // 4. If there's a concrete account ID, try to fetch live graph data for it
      if (primaryId) {
        try {
          const subgraph = await starApi.getSubgraph(primaryId, 2);
          context["graph_nodes"] = subgraph.nodes.length;
          context["graph_edges"] = subgraph.links.length;
          context["suspicious_edges"] = subgraph.suspicious_edges;

          // Pull risk info for the primary node if available
          const primaryNode = subgraph.nodes.find(
            (n) => n.id.toUpperCase() === primaryId
          );
          if (primaryNode) {
            context["account_risk_level"] = primaryNode.risk_level;
            context["account_risk_score"] = primaryNode.risk;
            context["account_flagged"] = primaryNode.flagged;
          }
        } catch {
          // Graph lookup failed (account not in graph yet) — proceed without it
          context["graph_note"] = `${primaryId} not found in current graph — may not have been processed yet`;
        }
      }

      // 5. SAR generation path
      if (
        userMessage.toLowerCase().includes("sar") ||
        userMessage.toLowerCase().includes("report")
      ) {
        const targetAccount = primaryId ?? "ACC-UNKNOWN";
        setGeneratingSar(true);

        const sarRes: any = await starApi.generateSAR({
          account_id: targetAccount,
          alert_ids: [],
          investigation_notes: `Requested by investigator for account ${targetAccount}. Context: ${JSON.stringify(context)}`,
        });
        setGeneratingSar(false);

        setActiveSar({
          id: `SAR-${Date.now()}`,
          subject: sarRes.subject || `Suspicious Activity Report — ${targetAccount}`,
          accountId: sarRes.account_id || targetAccount,
          narrative: sarRes.narrative || "Report generated.",
          riskScore: sarRes.risk_score || 0,
          gnnScore: sarRes.gnn_score || 0,
          entityCount: sarRes.entity_count || 0,
          totalAmount: sarRes.total_amount || 0,
          dateRange: sarRes.date_range || "Last 30 Days",
          pattern: sarRes.pattern || "Suspicious Activity",
          status: "draft",
          createdAt: new Date().toLocaleTimeString(),
        });

        const aiMsg: AIMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: `I have generated the Suspicious Activity Report (SAR) for **${targetAccount}**. Please review the draft in the workspace.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        addMessage(aiMsg);
      } else {
        // 6. Regular copilot query — with entity context injected
        const res: any = await starApi.copilotQuery(userMessage, "default", context);

        const aiMsg: AIMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: res.content || res.response || "Done.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          metadata: res.metadata?.cypherQuery ? { cypherQuery: res.metadata.cypherQuery } : undefined,
        };
        addMessage(aiMsg);
      }
    } catch (error) {
      console.error("Copilot error:", error);
      const errorMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "I encountered an error connecting to the intelligence engine. Please ensure the backend is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      addMessage(errorMsg);
      setGeneratingSar(false);
    } finally {
      setTyping(false);
    }
  },
}));
