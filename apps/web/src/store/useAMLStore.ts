// ============================================================
// STAR — Zustand AML Store
// Real-time AML state management
// ============================================================
import { create } from "zustand";
import type { AMLAlert, Transaction, GraphNode, GraphEdge, FilterState } from "@/types";
import { MOCK_ALERTS, MOCK_TRANSACTIONS, MOCK_GRAPH_NODES, MOCK_GRAPH_EDGES } from "@/data";

interface AMLState {
  // Live data
  alerts: AMLAlert[];
  transactions: Transaction[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];

  // Selected state
  selectedNodeId: string | null;
  selectedAlertId: string | null;
  selectedPath: string[];

  // Filters
  filters: FilterState;

  // Streaming state
  isStreaming: boolean;
  streamCount: number;

  // Actions
  setAlerts: (alerts: AMLAlert[]) => void;
  addAlert: (alert: AMLAlert) => void;
  addTransaction: (tx: Transaction) => void;
  selectNode: (id: string | null) => void;
  selectAlert: (id: string | null) => void;
  setSelectedPath: (path: string[]) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  toggleStreaming: () => void;
  incrementStreamCount: () => void;
  updateAlertStatus: (alertId: string, status: AMLAlert["status"]) => void;
}

export const useAMLStore = create<AMLState>((set) => ({
  alerts: MOCK_ALERTS,
  transactions: MOCK_TRANSACTIONS,
  graphNodes: MOCK_GRAPH_NODES,
  graphEdges: MOCK_GRAPH_EDGES,

  selectedNodeId: null,
  selectedAlertId: null,
  selectedPath: [],

  filters: {
    riskLevel: "all",
    alertType: "all",
    dateRange: "24h",
    search: "",
  },

  isStreaming: true,
  streamCount: 0,

  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts.slice(0, 19)],
  })),
  addTransaction: (tx) => set((state) => {
    const newEdges = [...state.graphEdges];
    const newNodes = [...state.graphNodes];

    if (!newNodes.find(n => n.id === tx.from)) {
      newNodes.push({
        id: tx.from,
        name: tx.from,
        risk: tx.anomalyScore * 100,
        anomalyScore: tx.anomalyScore,
        riskLevel: tx.risk === "critical" ? "critical" : tx.risk === "high" ? "high" : "normal",
        community: Math.floor(Math.random() * 3),
        type: "personal",
        flagged: tx.risk === "critical"
      });
    }

    if (!newNodes.find(n => n.id === tx.to)) {
      newNodes.push({
        id: tx.to,
        name: tx.to,
        risk: tx.anomalyScore * 100,
        anomalyScore: tx.anomalyScore,
        riskLevel: tx.risk === "critical" ? "critical" : tx.risk === "high" ? "high" : "normal",
        community: Math.floor(Math.random() * 3),
        type: "business",
        flagged: tx.risk === "critical"
      });
    }

    newEdges.push({
      source: tx.from,
      target: tx.to,
      amount: tx.amount,
      suspicious: tx.risk === "critical" || tx.risk === "high",
      type: tx.type,
      weight: Math.log(tx.amount || 1)
    });

    return {
      transactions: [tx, ...state.transactions.slice(0, 49)],
      streamCount: state.streamCount + 1,
      graphNodes: newNodes.length > 200 ? newNodes.slice(newNodes.length - 200) : newNodes,
      graphEdges: newEdges.length > 300 ? newEdges.slice(newEdges.length - 300) : newEdges
    };
  }),
  selectNode: (id) => set({ selectedNodeId: id }),
  selectAlert: (id) => set({ selectedAlertId: id }),
  setSelectedPath: (path) => set({ selectedPath: path }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  toggleStreaming: () => set((state) => ({ isStreaming: !state.isStreaming })),
  incrementStreamCount: () => set((state) => ({ streamCount: state.streamCount + 1 })),
  updateAlertStatus: (alertId, status) => set((state) => ({
    alerts: state.alerts.map((a) => a.id === alertId ? { ...a, status } : a),
  })),
}));
