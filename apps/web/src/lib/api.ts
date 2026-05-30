// ============================================================
// STAR — Backend API Client
// Typed client for all STAR backend endpoints
// ============================================================

import { MOCK_ALERTS, MOCK_GRAPH_EDGES, MOCK_GRAPH_NODES } from "@/data";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const MOCK_HEALTH: SystemHealth = {
  overall: "healthy",
  services: [
    {
      name: "api-gateway",
      status: "online",
      latency_ms: 12,
      details: "Using local fallback while backend is unavailable",
    },
    {
      name: "alerts",
      status: "online",
      latency_ms: 8,
      details: "Serving seeded alert data",
    },
    {
      name: "graph",
      status: "online",
      latency_ms: 9,
      details: "Serving seeded graph data",
    },
  ],
  uptime_seconds: 0,
  version: "local-fallback",
};

const MOCK_GRAPH_DATA: GraphData = {
  nodes: MOCK_GRAPH_NODES,
  links: MOCK_GRAPH_EDGES,
  total_nodes: MOCK_GRAPH_NODES.length,
  total_edges: MOCK_GRAPH_EDGES.length,
  suspicious_edges: MOCK_GRAPH_EDGES.filter((edge) => edge.suspicious).length,
};

function buildApiUrl(path: string): string {
  const base = BASE_URL.replace(/\/$/, "");
  return `${base}${path}`;
}

function getMockAlertById(id: string): AlertData {
  return (MOCK_ALERTS.find((alert) => alert.id === id) ?? MOCK_ALERTS[0]) as AlertData;
}

function getMockAlertStats(): Record<string, unknown> {
  const bySeverity = MOCK_ALERTS.reduce<Record<string, number>>((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});

  return {
    total_alerts: MOCK_ALERTS.length,
    open_alerts: MOCK_ALERTS.filter((alert) => alert.status === "open").length,
    investigating_alerts: MOCK_ALERTS.filter((alert) => alert.status === "investigating").length,
    escalated_alerts: MOCK_ALERTS.filter((alert) => alert.status === "escalated").length,
    by_severity: bySeverity,
  };
}

function getMockGraphStats(): Record<string, unknown> {
  return {
    total_nodes: MOCK_GRAPH_DATA.total_nodes,
    total_edges: MOCK_GRAPH_DATA.total_edges,
    suspicious_edges: MOCK_GRAPH_DATA.suspicious_edges,
    communities: new Set(MOCK_GRAPH_NODES.map((node) => node.community)).size,
  };
}

function getMockCommunities(): Record<string, unknown> {
  return {
    communities: MOCK_GRAPH_NODES.reduce<Record<string, string[]>>((acc, node) => {
      const key = String(node.community);
      if (!acc[key]) acc[key] = [];
      acc[key].push(node.id);
      return acc;
    }, {}),
  };
}

// ── Generic fetch helper ───────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  fallback?: T
): Promise<T> {
  const url = buildApiUrl(path);

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      if (fallback !== undefined) {
        return fallback;
      }

      const err = await res.text();
      throw new Error(`API ${path} failed [${res.status}]: ${err}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw error;
  }
}

// ── Types ─────────────────────────────────────────────────────

export interface SystemHealth {
  overall: "healthy" | "degraded" | "unhealthy";
  services: {
    name: string;
    status: "online" | "degraded" | "offline";
    latency_ms: number | null;
    details: string | null;
  }[];
  uptime_seconds: number;
  version: string;
}

export interface FusedRiskResponse {
  account_id: string | null;
  final_score: number;
  risk_level: string;
  breakdown: Record<string, number>;
  top_signals: string[];
  explanation: string;
  alert_generated: boolean;
  alert_id: string | null;
  if_score: {
    account_id: string;
    raw_score: number;
    risk_score: number;
    risk_level: string;
    threshold: number;
    is_anomalous: boolean;
    top_features: {
      feature: string;
      label: string;
      value: number;
      normalized_score: number;
      risk_level: string;
      description: string;
    }[];
    inference_ms: number;
  } | null;
  tgnn_score: {
    fraud_probability: number;
    fraud_score: number;
    risk_level: string;
    is_suspicious: boolean;
    attention_layers: number;
    edge_scores: number[];
    inference_ms: number;
  } | null;
  rule_hits: {
    rule: string;
    severity: string;
    description: string;
    score_contribution: number;
    evidence: Record<string, unknown>;
  }[];
  total_inference_ms: number;
}

export interface GraphData {
  nodes: {
    id: string;
    name: string;
    risk: number;
    anomaly_score: number;
    risk_level: string;
    community: number;
    type: string;
    flagged: boolean;
    x?: number;
    y?: number;
    size?: number;
  }[];
  links: {
    source: string;
    target: string;
    amount: number;
    suspicious: boolean;
    type: string;
    weight: number;
    fraud_probability?: number;
  }[];
  total_nodes: number;
  total_edges: number;
  suspicious_edges: number;
}

export interface AlertData {
  id: string;
  type: string;
  severity: string;
  score: number;
  entities: string[];
  entity_count: number;
  amount: string;
  amount_raw: number;
  time: string;
  timestamp: number;
  description: string;
  status: string;
  assignee?: string;
  tags: string[];
  related_transactions: string[];
  graph_path?: string[];
  if_score?: number;
  tgnn_score?: number;
  rule_hits: string[];
}

export interface ModelInfo {
  isolation_forest: Record<string, unknown>;
  tgnn: Record<string, unknown>;
}

// ── API Methods ────────────────────────────────────────────────

export const starApi = {
  // System
  getHealth: () => apiFetch<SystemHealth>("/system/health", {}, MOCK_HEALTH),
  getMetrics: () => apiFetch<Record<string, unknown>>("/system/metrics", {}, {}),
  getModelInfo: () => apiFetch<ModelInfo>("/system/models", {}, { isolation_forest: {}, tgnn: {} }),

  // Scoring
  scoreTransaction: (body: {
    transaction: {
      id: string;
      from_account: string;
      to_account: string;
      amount: number;
      currency?: string;
      payment_format?: string;
      timestamp?: number;
    };
    context_transactions?: unknown[];
  }) =>
    apiFetch<FusedRiskResponse>("/score/transaction", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  scoreAccount: (accountId: string, features: Record<string, number>) =>
    apiFetch<FusedRiskResponse>("/score/account", {
      method: "POST",
      body: JSON.stringify({ account_id: accountId, features }),
    }),

  // Alerts
  getAlerts: (params?: { status?: string; severity?: string; limit?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<AlertData[]>(`/alerts${qs ? `?${qs}` : ""}`, {}, MOCK_ALERTS as AlertData[]);
  },

  getAlert: (id: string) => apiFetch<AlertData>(`/alerts/${id}`, {}, getMockAlertById(id)),

  updateAlert: (id: string, status: string, assignee?: string) =>
    apiFetch<AlertData>(`/alerts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, assignee }),
    }),

  getAlertStats: () => apiFetch<Record<string, unknown>>("/alerts/stats/summary", {}, getMockAlertStats()),

  // Graph
  getSubgraph: (accountId: string, depth = 2) =>
    apiFetch<GraphData>(`/graph/subgraph?account_id=${accountId}&depth=${depth}`, {}, MOCK_GRAPH_DATA),

  getFullGraph: () => apiFetch<GraphData>("/graph/full", {}, MOCK_GRAPH_DATA),

  tracePath: (fromId: string, toId: string) =>
    apiFetch<{
      nodes: string[];
      total_amount: number;
      hops: number;
      is_circular: boolean;
    }>(`/graph/path?from_id=${fromId}&to_id=${toId}`, {}, {
      nodes: [fromId, toId],
      total_amount: 0,
      hops: 1,
      is_circular: fromId === toId,
    }),

  getCommunities: () => apiFetch<Record<string, unknown>>("/graph/communities", {}, getMockCommunities()),
  getGraphStats: () => apiFetch<Record<string, unknown>>("/graph/stats", {}, getMockGraphStats()),

  // Copilot
  copilotQuery: async (message: string, sessionId = "default", context?: Record<string, unknown>) => {
    const res = await fetch(buildApiUrl("/copilot/query/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId, context }),
    });
    if (!res.ok) throw new Error("Copilot query failed");
    return res.json() as Promise<{ id: string; role: string; content: string; timestamp: string }>;
  },

  copilotStatus: () => apiFetch<{ available: boolean; message: string }>("/copilot/status", {}, {
    available: false,
    message: "Backend unavailable; using local demo mode",
  }),

  generateSAR: (body: { account_id: string; alert_ids: string[]; investigation_notes?: string }) =>
    apiFetch<Record<string, unknown>>("/copilot/sar", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ── WebSocket Helper ───────────────────────────────────────────

export function createSTARWebSocket(
  onMessage: (data: unknown) => void,
  onConnected?: () => void,
  onDisconnected?: () => void,
): WebSocket {
  const wsUrl = BASE_URL.replace("http://", "ws://").replace("https://", "wss://");
  const ws = new WebSocket(`${wsUrl}/ws/stream`);

  ws.onopen = () => {
    console.log("[STAR WS] Connected to real-time stream");
    onConnected?.();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.warn("[STAR WS] Failed to parse message", e);
    }
  };

  ws.onclose = () => {
    console.log("[STAR WS] Disconnected");
    onDisconnected?.();
  };

  ws.onerror = (err) => {
    console.error("[STAR WS] Error", err);
  };

  return ws;
}
